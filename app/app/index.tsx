import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';

export default function IndexScreen() {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (user?.onboardingCompleted) {
      router.replace('/(main)/chat');
    } else {
      router.replace('/(auth)/onboarding');
    }
  }, [isAuthenticated, isLoading, user?.onboardingCompleted]);

  return <LoadingScreen message="Loading..." />;
}
