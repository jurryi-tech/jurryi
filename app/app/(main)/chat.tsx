import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text, Appbar, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useChatStore } from '@/stores/chatStore';
import { Message } from '@/services/chat';
import { getStateLabel, getDistrictLabel, getProblemTypeLabel } from '@/utils/helpers';
import { SUGGESTED_QUESTIONS } from '@/utils/constants';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import SuggestedQuestions from '@/components/chat/SuggestedQuestions';

export default function ChatScreen() {
  const { user } = useAuthStore();
  const {
    messages,
    currentConversation,
    isStreaming,
    streamingContent,
    isLoading,
    error,
    createConversation,
    sendMessage,
    clearCurrentConversation,
    clearError,
  } = useChatStore();

  const flatListRef = useRef<FlatList>(null);
  const [snackbarVisible, setSnackbarVisible] = React.useState(false);

  // Scroll to bottom when messages change or streaming content updates
  useEffect(() => {
    if (messages.length > 0 || streamingContent) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, streamingContent]);

  // Show error snackbar
  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const handleNewConversation = useCallback(() => {
    clearCurrentConversation();
  }, [clearCurrentConversation]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      let conversationId = currentConversation?._id;

      if (!conversationId) {
        try {
          conversationId = await createConversation('New Conversation');
        } catch {
          return;
        }
      }

      // Send message via store (which adds user message locally and streams)
      await sendMessage(conversationId, content);
    },
    [currentConversation, createConversation, sendMessage],
  );

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      handleSendMessage(question);
    },
    [handleSendMessage],
  );

  const welcomeMessage = React.useMemo(() => {
    if (!user) return '';
    const stateName = user.state ? getStateLabel(user.state) : '';
    const districtName =
      user.state && user.district
        ? getDistrictLabel(user.state, user.district)
        : '';
    const problemLabel = user.primaryProblemType
      ? getProblemTypeLabel(user.primaryProblemType)
      : '';

    let msg = `Namaste ${user.fullName}! I am LegalSahay, your personal legal assistant.`;

    if (stateName && districtName) {
      msg += ` I see you are based in ${districtName}, ${stateName}`;
      if (problemLabel) {
        msg += ` and dealing with ${problemLabel}.`;
      } else {
        msg += '.';
      }
    } else if (problemLabel) {
      msg += ` I see you are dealing with ${problemLabel}.`;
    }

    msg +=
      ' I am here to help you understand your rights and guide you through legal procedures. What would you like to know?';

    return msg;
  }, [user]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => (
      <ChatBubble
        content={item.content}
        role={item.role}
        timestamp={item.createdAt}
      />
    ),
    [],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Welcome message */}
      <ChatBubble content={welcomeMessage} role="assistant" />

      {/* Suggested questions */}
      <SuggestedQuestions
        problemType={user?.primaryProblemType}
        onSelect={handleSuggestedQuestion}
      />
    </View>
  );

  const renderFooter = () => {
    if (isStreaming && streamingContent) {
      return <ChatBubble content={streamingContent} role="assistant" />;
    }
    if (isStreaming && !streamingContent) {
      return <TypingIndicator />;
    }
    return null;
  };

  const isConversationEmpty = messages.length === 0 && !isStreaming;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <Appbar.Header style={styles.header} elevated>
        <Appbar.Content
          title="LegalSahay"
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon="plus"
          iconColor="#1a237e"
          onPress={handleNewConversation}
        />
      </Appbar.Header>

      {/* AI Disclosure Banner */}
      <View style={styles.aiBanner}>
        <Text style={styles.aiBannerText}>
          Responses are AI-generated and may contain errors. Not a substitute for professional legal advice.
        </Text>
      </View>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {isConversationEmpty ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.messageList}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
        )}
      </View>

      {/* Input */}
      <ChatInput onSend={handleSendMessage} disabled={isStreaming} />

      {/* Error Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          clearError();
        }}
        duration={4000}
        style={styles.snackbar}
        action={{
          label: 'Dismiss',
          onPress: () => {
            setSnackbarVisible(false);
            clearError();
          },
        }}
      >
        {error || 'Something went wrong'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a237e',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messageList: {
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 16,
  },
  aiBanner: {
    backgroundColor: '#fafafa',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  aiBannerText: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
});
