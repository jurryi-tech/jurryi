import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/userStore';
import StateSelection from '@/components/onboarding/StateSelection';
import ProblemTypeSelection from '@/components/onboarding/ProblemTypeSelection';
import LanguagePreference from '@/components/onboarding/LanguagePreference';

const TOTAL_STEPS = 3;

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View style={stepStyles.container}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
        <View key={step} style={stepStyles.stepRow}>
          <View
            style={[
              stepStyles.circle,
              step <= currentStep
                ? stepStyles.activeCircle
                : stepStyles.inactiveCircle,
            ]}
          >
            <Text
              style={[
                stepStyles.stepNumber,
                step <= currentStep
                  ? stepStyles.activeText
                  : stepStyles.inactiveText,
              ]}
            >
              {step}
            </Text>
          </View>
          {step < TOTAL_STEPS && (
            <View
              style={[
                stepStyles.line,
                step < currentStep
                  ? stepStyles.activeLine
                  : stepStyles.inactiveLine,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const stepStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#1a237e',
  },
  inactiveCircle: {
    backgroundColor: '#e0e0e0',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  activeText: {
    color: '#ffffff',
  },
  inactiveText: {
    color: '#757575',
  },
  line: {
    width: 40,
    height: 3,
    marginHorizontal: 4,
  },
  activeLine: {
    backgroundColor: '#1a237e',
  },
  inactiveLine: {
    backgroundColor: '#e0e0e0',
  },
});

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding, isUpdating, error, clearError } = useUserStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedProblemType, setSelectedProblemType] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [validationError, setValidationError] = useState('');

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedState.length > 0 && selectedDistrict.length > 0;
      case 2:
        return selectedProblemType.length > 0;
      case 3:
        return selectedLanguage.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      switch (currentStep) {
        case 1:
          setValidationError('Please select your state and district');
          break;
        case 2:
          setValidationError('Please select your problem type');
          break;
        default:
          setValidationError('Please complete this step');
      }
      setSnackbarVisible(true);
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!canGoNext()) {
      setValidationError('Please select your language preference');
      setSnackbarVisible(true);
      return;
    }

    try {
      await completeOnboarding({
        state: selectedState,
        district: selectedDistrict,
        preferredLanguage: selectedLanguage,
        primaryProblemType: selectedProblemType || undefined,
      });
      router.replace('/(main)/chat');
    } catch {
      setSnackbarVisible(true);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StateSelection
            selectedState={selectedState}
            selectedDistrict={selectedDistrict}
            onStateChange={setSelectedState}
            onDistrictChange={setSelectedDistrict}
          />
        );
      case 2:
        return (
          <ProblemTypeSelection
            selectedType={selectedProblemType}
            onSelect={setSelectedProblemType}
          />
        );
      case 3:
        return (
          <LanguagePreference
            selectedLanguage={selectedLanguage}
            onSelect={setSelectedLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Step Content */}
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={styles.contentInner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <Button
              mode="outlined"
              onPress={handleBack}
              style={styles.backButton}
              labelStyle={styles.backButtonLabel}
            >
              Back
            </Button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button
              mode="contained"
              onPress={handleNext}
              style={[styles.nextButton, currentStep === 1 && styles.fullWidth]}
              contentStyle={styles.nextButtonContent}
              labelStyle={styles.nextButtonLabel}
            >
              Next
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleComplete}
              loading={isUpdating}
              disabled={isUpdating}
              style={styles.nextButton}
              contentStyle={{ flexDirection: 'row-reverse', paddingVertical: 6 }}
              labelStyle={styles.nextButtonLabel}
              icon="arrow-right"
            >
              Start Using LegalSahay
            </Button>
          )}
        </View>
      </View>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => {
          setSnackbarVisible(false);
          setValidationError('');
          clearError();
        }}
        duration={3000}
        style={styles.snackbar}
      >
        {validationError || error || 'Something went wrong'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  contentContainer: {
    flex: 1,
  },
  contentInner: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    flex: 1,
    borderColor: '#1a237e',
    borderRadius: 8,
  },
  backButtonLabel: {
    color: '#1a237e',
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    borderRadius: 8,
    backgroundColor: '#1a237e',
  },
  fullWidth: {
    flex: 1,
  },
  nextButtonContent: {
    paddingVertical: 6,
  },
  nextButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
});
