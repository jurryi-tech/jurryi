import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import { PROBLEM_TYPES } from '@/utils/constants';

interface ProblemTypeSelectionProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

const ProblemTypeSelection: React.FC<ProblemTypeSelectionProps> = ({
  selectedType,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>What is your legal issue about?</Text>
      <Text style={styles.subheading}>
        Select the category that best describes your situation
      </Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {PROBLEM_TYPES.map((type) => {
            const isSelected = selectedType === type.value;
            return (
              <Card
                key={type.value}
                mode={isSelected ? 'contained' : 'outlined'}
                onPress={() => onSelect(type.value)}
                style={[
                  styles.card,
                  isSelected && styles.selectedCard,
                ]}
              >
                <Card.Content style={styles.cardContent}>
                  <IconButton
                    icon={type.icon}
                    size={28}
                    iconColor={isSelected ? '#ffffff' : '#1a237e'}
                    style={[
                      styles.iconButton,
                      isSelected && styles.selectedIconButton,
                    ]}
                  />
                  <Text
                    style={[
                      styles.cardLabel,
                      isSelected && styles.selectedLabel,
                    ]}
                    numberOfLines={2}
                  >
                    {type.label}
                  </Text>
                </Card.Content>
              </Card>
            );
          })}
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    paddingBottom: 20,
  },
  card: {
    width: '48%',
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  selectedCard: {
    backgroundColor: '#1a237e',
    borderColor: '#1a237e',
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconButton: {
    margin: 0,
    backgroundColor: '#e8eaf6',
  },
  selectedIconButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginTop: 4,
  },
  selectedLabel: {
    color: '#ffffff',
  },
});

export default ProblemTypeSelection;
