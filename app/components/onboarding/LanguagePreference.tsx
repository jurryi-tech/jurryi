import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, RadioButton } from 'react-native-paper';
import { LANGUAGES } from '@/utils/constants';

interface LanguagePreferenceProps {
  selectedLanguage: string;
  onSelect: (language: string) => void;
}

const LanguagePreference: React.FC<LanguagePreferenceProps> = ({
  selectedLanguage,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose your preferred language</Text>
      <Text style={styles.subheading}>
        LegalSahay will respond in the language you select
      </Text>

      <View style={styles.optionsContainer}>
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLanguage === lang.value;
          return (
            <Card
              key={lang.value}
              mode={isSelected ? 'contained' : 'outlined'}
              onPress={() => onSelect(lang.value)}
              style={[
                styles.card,
                isSelected && styles.selectedCard,
              ]}
            >
              <Card.Content style={styles.cardContent}>
                <View style={styles.radioRow}>
                  <RadioButton
                    value={lang.value}
                    status={isSelected ? 'checked' : 'unchecked'}
                    onPress={() => onSelect(lang.value)}
                    color={isSelected ? '#ffffff' : '#1a237e'}
                    uncheckedColor="#757575"
                  />
                  <View style={styles.textContainer}>
                    <Text
                      style={[styles.label, isSelected && styles.selectedText]}
                    >
                      {lang.label}
                    </Text>
                    <Text
                      style={[
                        styles.nativeLabel,
                        isSelected && styles.selectedSecondary,
                      ]}
                    >
                      {lang.nativeLabel}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.description,
                    isSelected && styles.selectedSecondary,
                  ]}
                >
                  {lang.description}
                </Text>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a237e',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  card: {
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  selectedCard: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  cardContent: {
    paddingVertical: 12,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
  nativeLabel: {
    fontSize: 14,
    color: '#757575',
  },
  description: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
    marginLeft: 48,
  },
  selectedText: {
    color: '#ffffff',
  },
  selectedSecondary: {
    color: 'rgba(255,255,255,0.75)',
  },
});

export default LanguagePreference;
