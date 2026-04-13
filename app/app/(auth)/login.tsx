import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Snackbar, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';

const loginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.phone, data.password);
      const user = useAuthStore.getState().user;
      if (user?.onboardingCompleted) {
        router.replace('/(main)/chat');
      } else {
        router.replace('/(auth)/onboarding');
      }
    } catch {
      setSnackbarVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo / Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logoCircle}>
              <IconButton icon="scale-balance" size={40} iconColor="#ffffff" />
            </View>
            <Text style={styles.brandTitle}>Jurryi</Text>
            <Text style={styles.brandSubtitle}>Your Personal Legal Assistant</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.heading}>Welcome Back</Text>
            <Text style={styles.subheading}>
              Sign in to continue getting legal guidance
            </Text>

            {/* Phone Number */}
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Phone Number"
                  placeholder="9876543210"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  maxLength={10}
                  left={<TextInput.Affix text="+91 " />}
                  error={!!errors.phone}
                  style={styles.input}
                  outlineColor="#e0e0e0"
                  activeOutlineColor="#1a237e"
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}

            {/* Password */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  mode="outlined"
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry={!passwordVisible}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? 'eye-off' : 'eye'}
                      onPress={() => setPasswordVisible(!passwordVisible)}
                    />
                  }
                  error={!!errors.password}
                  style={styles.input}
                  outlineColor="#e0e0e0"
                  activeOutlineColor="#1a237e"
                />
              )}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Login Button */}
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Login
            </Button>

            {/* Register Link */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>{"Don't have an account? "}</Text>
              <Button
                mode="text"
                onPress={() => router.push('/(auth)/register')}
                compact
                labelStyle={styles.linkButton}
              >
                Register
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
        {error || 'Login failed. Please try again.'}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a237e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a237e',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 24,
  },
  input: {
    marginBottom: 4,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#1a237e',
  },
  buttonContent: {
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#757575',
  },
  linkButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a237e',
  },
  snackbar: {
    backgroundColor: '#d32f2f',
  },
});
