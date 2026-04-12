/**
 * Claude API Service
 *
 * Direct Claude API integration using @anthropic-ai/sdk.
 * Provides both non-streaming (for title generation and short tasks)
 * and streaming (for real-time chat via SSE) interfaces.
 */

import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env';

const client = new Anthropic({ apiKey: env.anthropicApiKey });

export interface MessageInput {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  content: string;
  tokensUsed: { input: number; output: number };
}

/**
 * Non-streaming Claude call — used for title generation and short tasks
 */
export async function sendToClaude(
  conversationHistory: MessageInput[],
  systemPrompt: string,
  userMessage: string
): Promise<ClaudeResponse> {
  const messages: MessageInput[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages
  });

  const textContent = response.content.find(block => block.type === 'text');
  return {
    content: textContent?.text || '',
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens
    }
  };
}

/**
 * Streaming Claude call — used for real-time chat responses via SSE
 */
export function streamFromClaude(
  conversationHistory: MessageInput[],
  systemPrompt: string,
  userMessage: string
) {
  const messages: MessageInput[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  return client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages
  });
}
