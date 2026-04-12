import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

interface SuggestedQuestionsProps {
  problemType?: string;
  onSelect: (question: string) => void;
}

const SUGGESTIONS: Record<string, string[]> = {
  property_dispute: [
    'What documents do I need to prove property ownership?',
    'How do I file a property dispute case in civil court?',
    'What is the process for property mutation?',
  ],
  criminal_matter: [
    'How do I file an FIR at the police station?',
    'What are my rights if I am arrested?',
    'How to apply for anticipatory bail?',
  ],
  family_matter: [
    'What is the process for filing for divorce?',
    'How can I claim maintenance/alimony?',
    'What are the child custody laws in India?',
  ],
  consumer_complaint: [
    'How do I file a consumer complaint online?',
    'What is the compensation I can claim?',
    'What is the time limit for filing a consumer case?',
  ],
  employment_issue: [
    'Can my employer terminate me without notice?',
    'How do I file a complaint for unpaid wages?',
    'What are my rights regarding workplace harassment?',
  ],
  default: [
    'What are my legal rights in this situation?',
    'What documents will I need to prepare?',
    'Where can I get free legal aid near me?',
    'What is the procedure to file a case?',
  ],
};

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  problemType,
  onSelect,
}) => {
  const questions = SUGGESTIONS[problemType || ''] || SUGGESTIONS.default;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested Questions</Text>
      <View style={styles.chipContainer}>
        {questions.map((question, index) => (
          <Chip
            key={index}
            mode="outlined"
            onPress={() => onSelect(question)}
            style={styles.chip}
            textStyle={styles.chipText}
            icon="help-circle-outline"
          >
            {question}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderColor: '#1a237e',
    backgroundColor: 'transparent',
  },
  chipText: {
    fontSize: 13,
    color: '#1a237e',
  },
});

export default SuggestedQuestions;
