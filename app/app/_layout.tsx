import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1a237e',
    secondary: '#ff8f00',
    background: '#ffffff',
    surface: '#f5f5f5',
    error: '#d32f2f',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onBackground: '#212121',
    onSurface: '#212121',
    outline: '#757575',
    surfaceVariant: '#f5f5f5',
  },
};

function useProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (user?.onboardingCompleted) {
        router.replace('/(main)/chat');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, segments, user?.onboardingCompleted]);
}

export default function RootLayout() {
  const { isLoading, loadStoredAuth } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadStoredAuth();
      setInitializing(false);
    };
    init();
  }, []);

  useProtectedRoute();

  if (initializing || isLoading) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <LoadingScreen message="Starting LegalSahay..." />
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
