import { create } from 'zustand';
import api from '@/services/api';
import { useAuthStore, User } from '@/stores/authStore';

// ---------- Types ----------

export interface OnboardingData {
  state: string;
  district: string;
  preferredLanguage?: string;
  primaryProblemType?: string;
  problemDescription?: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  state?: string;
  district?: string;
  preferredLanguage?: string;
  primaryProblemType?: string;
  problemDescription?: string;
  email?: string;
  profile?: {
    age?: number;
    gender?: string;
    occupation?: string;
    incomeCategory?: string;
    hasExistingLawyer?: boolean;
    urgencyLevel?: string;
    opposingPartyType?: string;
  };
}

interface UserState {
  isUpdating: boolean;
  error: string | null;

  // Actions
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

// ---------- Helper ----------

function mapApiUserToUser(userData: Record<string, unknown>): User {
  return {
    id: (userData._id as string) ?? (userData.id as string),
    phone: userData.phone as string,
    fullName: userData.fullName as string,
    state: (userData.state as string) ?? '',
    district: (userData.district as string) ?? '',
    preferredLanguage: (userData.preferredLanguage as string) ?? 'en',
    primaryProblemType: (userData.primaryProblemType as string) ?? '',
    onboardingCompleted: (userData.onboardingCompleted as boolean) ?? false,
    email: userData.email as string | undefined,
    profile: (userData.profile as User['profile']) ?? {},
    createdAt: userData.createdAt as string | undefined,
    updatedAt: userData.updatedAt as string | undefined,
  };
}

// ---------- Store ----------

export const useUserStore = create<UserState>((set) => ({
  isUpdating: false,
  error: null,

  completeOnboarding: async (data: OnboardingData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await api.post('/user/onboarding', data);
      const userData = response.data;
      const authStore = useAuthStore.getState();

      authStore.setUser({
        ...authStore.user!,
        state: userData.state,
        district: userData.district,
        preferredLanguage: userData.preferredLanguage ?? 'en',
        primaryProblemType: userData.primaryProblemType ?? '',
        onboardingCompleted: true,
      });

      set({ isUpdating: false });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (error instanceof Error ? error.message : 'Onboarding failed');
      set({ error: message, isUpdating: false });
      throw new Error(message);
    }
  },

  updateProfile: async (data: ProfileUpdateData) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await api.patch('/user/profile', data);
      const userData = response.data;
      const authStore = useAuthStore.getState();

      authStore.setUser(mapApiUserToUser(userData));

      set({ isUpdating: false });
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        (error instanceof Error ? error.message : 'Update failed');
      set({ error: message, isUpdating: false });
      throw new Error(message);
    }
  },

  fetchProfile: async () => {
    set({ isUpdating: true, error: null });
    try {
      const response = await api.get('/user/profile');
      const userData = response.data;
      const authStore = useAuthStore.getState();

      authStore.setUser(mapApiUserToUser(userData));

      set({ isUpdating: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch profile',
        isUpdating: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
