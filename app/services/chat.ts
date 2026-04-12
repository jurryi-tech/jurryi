import * as SecureStore from 'expo-secure-store';
import api from './api';
import { API_BASE_URL } from '@/utils/constants';

// ---------- Types ----------

export interface Message {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: { input: number; output: number };
  searchResults?: { title: string; url: string; snippet: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  category: string;
  jurisdiction: {
    state?: string;
    district?: string;
    courtType?: string;
  };
  status: 'active' | 'resolved' | 'archived';
  summary: string;
  extractedContext: {
    sections: string[];
    acts: string[];
    documentTypesNeeded: string[];
    keyFacts: string[];
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
}

// ---------- REST endpoints (via axios) ----------

export async function createConversation(
  data?: { title?: string; category?: string },
): Promise<Conversation> {
  const response = await api.post('/chat/conversations', data ?? {});
  return response.data.conversation;
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await api.get('/chat/conversations');
  return response.data.conversations;
}

export async function getConversation(id: string): Promise<Conversation> {
  const response = await api.get(`/chat/conversations/${id}`);
  return response.data.conversation;
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/chat/conversations/${id}`);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const response = await api.get(
    `/chat/conversations/${conversationId}/messages`,
  );
  return response.data.messages;
}

// ---------- SSE streaming ----------

export async function sendMessageStream(
  conversationId: string,
  content: string,
  onChunk: (text: string) => void,
  onDone: (messageId: string) => void,
  onError: (error: string) => void,
): Promise<void> {
  const token = await SecureStore.getItemAsync('accessToken');

  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    onError(`Request failed (${response.status}): ${errorBody}`);
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    onError('Response body is not readable');
    return;
  }

  const decoder = new TextDecoder();

  try {
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep last potentially-incomplete line in buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));

          if (data.type === 'chunk') {
            onChunk(data.content);
          } else if (data.type === 'done') {
            onDone(data.messageId ?? '');
          } else if (data.type === 'error') {
            onError(data.message ?? 'Stream error');
          }
        } catch {
          // Skip non-JSON SSE lines (e.g. comments, keep-alive)
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim().startsWith('data: ')) {
      try {
        const data = JSON.parse(buffer.trim().slice(6));
        if (data.type === 'chunk') onChunk(data.content);
        else if (data.type === 'done') onDone(data.messageId ?? '');
        else if (data.type === 'error') onError(data.message ?? 'Stream error');
      } catch {
        // ignore
      }
    }
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Stream reading failed');
  } finally {
    reader.releaseLock();
  }
}

// Convenience: bundled as an object for backward compatibility
export const chatService = {
  getConversations,
  createConversation,
  getConversation,
  deleteConversation,
  getMessages,
  sendMessageStream,
};
