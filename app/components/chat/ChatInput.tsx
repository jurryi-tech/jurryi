import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton } from 'react-native-paper';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        placeholder="Type your legal question..."
        value={text}
        onChangeText={setText}
        style={styles.input}
        multiline
        maxLength={2000}
        disabled={disabled}
        outlineColor="#e0e0e0"
        activeOutlineColor="#1a237e"
        onSubmitEditing={handleSend}
        dense
      />
      <IconButton
        icon="send"
        iconColor="#ffffff"
        size={24}
        style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#ffffff',
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: '#1a237e',
    borderRadius: 24,
    marginLeft: 4,
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
});

export default ChatInput;
