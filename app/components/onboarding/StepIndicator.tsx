import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../utils/constants';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step}>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted,
                  !isActive && !isCompleted && styles.dotUpcoming,
                ]}
              >
                {isCompleted && (
                  <Text style={styles.checkmark}>{'✓'}</Text>
                )}
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    (isCompleted || (isActive && index < currentStep))
                      ? styles.lineCompleted
                      : styles.lineUpcoming,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <Text style={styles.stepText}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: `${COLORS.primary}40`,
  },
  dotCompleted: {
    backgroundColor: COLORS.primary,
  },
  dotUpcoming: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#bdbdbd',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  line: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  lineCompleted: {
    backgroundColor: COLORS.primary,
  },
  lineUpcoming: {
    backgroundColor: '#bdbdbd',
  },
  stepText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
});

export default StepIndicator;
