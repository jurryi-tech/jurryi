import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/auth';
import api from '@/services/api';

// ---------- Types ----------

export interface User {
  id: string;
  phone: string;
  fullName: string;
  state: string;
  district: string;
  preferredLanguage: string;
  primaryProblemType: string;
  onboardingCompleted: boolean;
  email?: string;
  profile: {
    age?: number;
    gender?: string;
    occupation?: string;
    incomeCategory?: string;
    hasExistingLawyer?: boolean;
    urgencyLevel?: string;
    opposingPartyType?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  clearUser: () => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

// ---------- Store ----------

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: User) => set({ user, isAuthenticated: true }),

      updateUser: (data: Partial<User>) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...data } });
      },

      clearUser: () =>
        set({ user: null, isAuthenticated: false, error: null }),

      login: async (phone: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login({ phone, password });
          set({
            user: data.user as User,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message =
            (error as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ||
            (error instanceof Error ? error.message : 'Login failed');
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      register: async (
        phone: string,
        password: string,
        fullName: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register({ phone, password, fullName });
          set({
            user: {
              id: data.user.id,
              phone: data.user.phone,
              fullName: data.user.fullName,
              state: data.user.state ?? '',
              district: data.user.district ?? '',
              preferredLanguage: data.user.preferredLanguage ?? 'en',
              primaryProblemType: data.user.primaryProblemType ?? '',
              onboardingCompleted: data.user.onboardingCompleted ?? false,
              profile: data.user.profile ?? {},
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          const message =
            (error as { response?: { data?: { error?: string } } })?.response
              ?.data?.error ||
            (error instanceof Error ? error.message : 'Registration failed');
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Clear local state regardless
        }
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, isAuthenticated: false, error: null });
      },

      loadStoredAuth: async () => {
        set({ isLoading: true });
        try {
          const tokens = await authService.getStoredTokens();
          if (!tokens.accessToken) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Validate token by fetching profile
          const response = await api.get('/user/profile');
          const userData = response.data;

          set({
            user: {
              id: userData._id ?? userData.id,
              phone: userData.phone,
              fullName: userData.fullName,
              state: userData.state ?? '',
              district: userData.district ?? '',
              preferredLanguage: userData.preferredLanguage ?? 'en',
              primaryProblemType: userData.primaryProblemType ?? '',
              onboardingCompleted: userData.onboardingCompleted ?? false,
              profile: userData.profile ?? {},
              email: userData.email,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false, isAuthenticated: false, user: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'legalsahay-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
