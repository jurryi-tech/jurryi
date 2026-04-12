import React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: string;
}

const handleReportContent = () => {
  Alert.alert(
    'Report Content',
    'Are you sure you want to report this response as inappropriate?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Reported', 'Thank you. We will review this content.'),
      },
    ],
  );
};

const ChatBubble: React.FC<ChatBubbleProps> = ({ content, role, timestamp }) => {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Surface
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
        elevation={1}
      >
        {isUser ? (
          <Text style={styles.userText}>{content}</Text>
        ) : (
          <Markdown style={markdownStyles}>{content}</Markdown>
        )}
      </Surface>
      {isAssistant && (
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleReportContent}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="flag-outline" size={14} color="#9e9e9e" />
          <Text style={styles.reportText}>Report</Text>
        </TouchableOpacity>
      )}
      {timestamp && (
        <Text
          style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.assistantTimestamp,
          ]}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#1a237e',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#f5f5f5',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  assistantTimestamp: {
    textAlign: 'left',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  reportText: {
    fontSize: 10,
    color: '#9e9e9e',
    marginLeft: 3,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#212121',
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a237e',
    marginVertical: 4,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a237e',
    marginVertical: 4,
  },
  strong: {
    fontWeight: 'bold',
  },
  link: {
    color: '#1a237e',
    textDecorationLine: 'underline',
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  code_inline: {
    backgroundColor: '#e8e8e8',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  fence: {
    backgroundColor: '#e8e8e8',
    padding: 8,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
});

export default ChatBubble;
