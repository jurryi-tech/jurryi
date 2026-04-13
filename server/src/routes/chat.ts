/**
 * Chat Routes
 *
 * Manages conversations and messages. Integrates with Claude API via
 * streaming (SSE) for real-time responses, uses the personalized system
 * prompt from contextBuilder, and optionally queries Tavily for
 * real-time legal search when relevant keywords are detected.
 */

import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { chatLimiter } from '../middleware/rateLimiter';
import { buildSystemPrompt } from '../services/contextBuilder';
import { streamFromClaude, sendToClaude, MessageInput } from '../services/claude';
import { searchLegalInfo } from '../services/tavily';

const router = Router();

// ---- Validation Schemas ----

const createConversationSchema = z.object({
  title: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
});

const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(10000, 'Message is too long'),
});

// Keywords that trigger Tavily real-time search
const SEARCH_TRIGGER_REGEX = /\b(latest|current|recent|2024|2025|2026|new law|amendment|notification|circular|supreme court|high court judgment)\b/i;

// ---- Routes ----

/**
 * GET /conversations
 * List all conversations for the authenticated user.
 */
router.get('/conversations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversations = await Conversation.find({ userId: req.userId! })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /conversations
 * Create a new conversation.
 */
router.post('/conversations', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createConversationSchema.parse(req.body);

    const user = await User.findById(req.userId!);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const conversation = await Conversation.create({
      userId: req.userId!,
      title: data.title || 'New Conversation',
      category: data.category || '',
      jurisdiction: {
        state: user.state || '',
        district: user.district || '',
      },
    });

    await User.findByIdAndUpdate(req.userId!, {
      $inc: { conversationCount: 1 },
      lastActiveAt: new Date(),
    });

    res.status(201).json({ conversation });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /conversations/:id
 * Get a single conversation with its messages.
 */
router.get('/conversations/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.userId!,
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await Message.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ conversation, messages });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /conversations/:id/messages
 * Send a message and get an AI response via SSE streaming.
 *
 * Flow:
 * 1. Validate input and verify conversation ownership
 * 2. Save user message to DB
 * 3. Load user profile and last 20 messages for context
 * 4. Build personalized system prompt
 * 5. Check for real-time search keywords → call Tavily if needed
 * 6. Stream Claude response back via SSE
 * 7. Save assistant message after stream completes
 * 8. Auto-generate title for first message
 */
router.post(
  '/conversations/:id/messages',
  chatLimiter,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = sendMessageSchema.parse(req.body);

      // Verify conversation ownership
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.userId!,
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      // Load user profile for personalized system prompt
      const user = await User.findById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Save the user message immediately
      const userMessage = await Message.create({
        conversationId: conversation._id,
        role: 'user',
        content: data.content,
      });

      // Load last 20 messages for conversation context
      const recentMessages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      // Reverse to chronological order
      recentMessages.reverse();

      // Build conversation history for Claude (exclude system messages)
      const conversationHistory: MessageInput[] = recentMessages
        .filter((msg: any) => msg.role !== 'system')
        .slice(0, -1) // Exclude the just-saved user message (we'll pass it separately)
        .map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Build personalized system prompt
      const systemPrompt = buildSystemPrompt(user, conversation);

      // Check if message needs real-time search
      let messageContent = data.content;
      if (SEARCH_TRIGGER_REGEX.test(data.content)) {
        try {
          const searchResults = await searchLegalInfo(data.content, user.state);
          if (searchResults.length > 0) {
            const searchContext = searchResults
              .map((r) => `- ${r.title}: ${r.content}\n  Source: ${r.url}`)
              .join('\n');

            messageContent = `${data.content}\n\n[REFERENCE INFORMATION FROM RECENT SOURCES — use these to supplement your response where relevant:\n${searchContext}\n]`;

            // Save search results to the user message for reference
            await Message.findByIdAndUpdate(userMessage._id, {
              searchResults: searchResults.map((r) => ({
                title: r.title,
                url: r.url,
                snippet: r.content.substring(0, 200),
              })),
            });
          }
        } catch (searchError) {
          console.error('Search failed, continuing without results:', searchError);
        }
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      // Track if client disconnects
      let clientDisconnected = false;
      req.on('close', () => {
        clientDisconnected = true;
      });

      // Stream response from Claude
      let fullContent = '';
      let inputTokens = 0;
      let outputTokens = 0;

      try {
        const stream = streamFromClaude(conversationHistory, systemPrompt, messageContent);

        stream.on('text', (text) => {
          if (clientDisconnected) return;
          fullContent += text;
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`);
        });

        const finalMessage = await stream.finalMessage();
        inputTokens = finalMessage.usage.input_tokens;
        outputTokens = finalMessage.usage.output_tokens;

        // Save assistant message to DB
        const assistantMessage = await Message.create({
          conversationId: conversation._id,
          role: 'assistant',
          content: fullContent,
          tokensUsed: { input: inputTokens, output: outputTokens },
        });

        // Send done event
        if (!clientDisconnected) {
          res.write(
            `data: ${JSON.stringify({ type: 'done', messageId: assistantMessage._id })}\n\n`
          );
        }

        // Auto-generate title from first user message
        const messageCount = await Message.countDocuments({
          conversationId: conversation._id,
          role: 'user',
        });

        if (messageCount === 1 && conversation.title === 'New Conversation') {
          try {
            const titleResponse = await sendToClaude(
              [],
              'Generate a concise 4-5 word title for a legal conversation that starts with the following message. Return ONLY the title text, nothing else. No quotes.',
              data.content
            );
            const title = titleResponse.content.trim().substring(0, 100);
            if (title) {
              await Conversation.findByIdAndUpdate(conversation._id, { title });
            }
          } catch (titleError) {
            // Non-critical — just use default title
            console.error('Title generation failed:', titleError);
          }
        }

        // Update user last active
        await User.findByIdAndUpdate(req.userId!, { lastActiveAt: new Date() });
      } catch (streamError) {
        console.error('Claude streaming error:', streamError);
        if (!clientDisconnected) {
          res.write(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'Failed to generate response. Please try again.',
            })}\n\n`
          );
        }
      }

      if (!clientDisconnected) {
        res.end();
      }
    } catch (error) {
      // If headers haven't been sent yet, pass to error handler
      if (!res.headersSent) {
        next(error);
      } else {
        console.error('Error after SSE headers sent:', error);
        res.write(
          `data: ${JSON.stringify({ type: 'error', message: 'An unexpected error occurred.' })}\n\n`
        );
        res.end();
      }
    }
  }
);

/**
 * GET /conversations/:id/messages
 * Get all messages for a conversation.
 */
router.get(
  '/conversations/:id/messages',
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const conversation = await Conversation.findOne({
        _id: req.params.id,
        userId: req.userId!,
      });

      if (!conversation) {
        res.status(404).json({ error: 'Conversation not found' });
        return;
      }

      const messages = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .lean();

      res.json({ messages });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /conversations/:id
 * Delete a conversation and all its messages.
 */
router.delete('/conversations/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId!,
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    await Message.deleteMany({ conversationId: conversation._id });

    // Decrement conversation count (don't go below 0)
    await User.findByIdAndUpdate(req.userId!, {
      $inc: { conversationCount: -1 },
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
