import { create } from 'zustand';
import {
  Conversation,
  Message,
  getConversations,
  createConversation as apiCreateConversation,
  getConversation,
  getMessages,
  deleteConversation as apiDeleteConversation,
  sendMessageStream,
} from '@/services/chat';

// ---------- Types ----------

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  // Actions
  loadConversations: () => Promise<void>;
  createConversation: (title?: string, category?: string) => Promise<string>;
  loadConversation: (id: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  clearCurrentConversation: () => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStreamMessage: (messageId: string) => void;
  addLocalMessage: (message: Message) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
}

// ---------- Store ----------

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: '',
  error: null,

  loadConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await getConversations();
      set({ conversations, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch conversations',
        isLoading: false,
      });
    }
  },

  createConversation: async (
    title?: string,
    category?: string,
  ): Promise<string> => {
    try {
      const conversation = await apiCreateConversation({ title, category });
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversation: conversation,
        messages: [],
      }));
      return conversation._id;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to create conversation';
      set({ error: message });
      throw new Error(message);
    }
  },

  loadConversation: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const [conversation, messages] = await Promise.all([
        getConversation(id),
        getMessages(id),
      ]);
      set({
        currentConversation: conversation,
        messages,
        isLoading: false,
      });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to load conversation',
        isLoading: false,
      });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    const { currentConversation } = get();

    // Add the user message locally for immediate UI feedback
    const userMessage: Message = {
      _id: `temp_${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: '',
      error: null,
    }));

    let fullContent = '';

    try {
      await sendMessageStream(
        conversationId,
        content,
        // onChunk
        (chunk: string) => {
          fullContent += chunk;
          set({ streamingContent: fullContent });
        },
        // onDone
        (messageId: string) => {
          const assistantMessage: Message = {
            _id: messageId || `msg_${Date.now()}`,
            conversationId,
            role: 'assistant',
            content: fullContent,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isStreaming: false,
            streamingContent: '',
          }));
        },
        // onError
        (errorMsg: string) => {
          set({
            error: errorMsg,
            isStreaming: false,
            streamingContent: '',
          });
        },
      );
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to send message',
        isStreaming: false,
        streamingContent: '',
      });
    }
  },

  deleteConversation: async (id: string) => {
    try {
      await apiDeleteConversation(id);
      set((state) => ({
        conversations: state.conversations.filter((c) => c._id !== id),
        currentConversation:
          state.currentConversation?._id === id
            ? null
            : state.currentConversation,
        messages:
          state.currentConversation?._id === id ? [] : state.messages,
      }));
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete conversation',
      });
    }
  },

  clearCurrentConversation: () => {
    set({
      currentConversation: null,
      messages: [],
      streamingContent: '',
      isStreaming: false,
    });
  },

  appendStreamChunk: (chunk: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + chunk,
    }));
  },

  finalizeStreamMessage: (messageId: string) => {
    const { streamingContent, currentConversation } = get();
    if (!streamingContent) return;

    const assistantMessage: Message = {
      _id: messageId || `msg_${Date.now()}`,
      conversationId: currentConversation?._id ?? '',
      role: 'assistant',
      content: streamingContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, assistantMessage],
      isStreaming: false,
      streamingContent: '',
    }));
  },

  addLocalMessage: (message: Message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  clearError: () => set({ error: null }),
}));
