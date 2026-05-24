import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { authService } from '../services/authService';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true while restoring the saved session at startup
  isSubmitting: boolean; // true while a login/register request is in flight
  error: string | null;

  restoreToken: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  /** Update premium fields locally + persist to storage (called after checkout) */
  updatePremium: (isPremium: boolean, premiumPlan: string, premiumUntil: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isSubmitting: false,
  error: null,

  // Restore the saved session when the app starts
  restoreToken: async () => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.TOKEN);
      const userStr = await storage.getItem(STORAGE_KEYS.USER);
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isLoading: false });
      } else {
        set({ token: null, user: null, isLoading: false });
      }
    } catch {
      set({ token: null, user: null, isLoading: false });
    }
  },

  // POST /api/auth/login
  signIn: async (email, password) => {
    set({ isSubmitting: true, error: null });
    try {
      const data = await authService.login(email.trim(), password);
      const { token, ...user } = data;
      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      set({ token, user, isSubmitting: false, error: null });
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },

  // POST /api/auth/register
  signUp: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const data = await authService.register({
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
        phone: payload.phone.trim(),
      });
      const { token, ...user } = data;
      await storage.setItem(STORAGE_KEYS.TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      set({ token, user, isSubmitting: false, error: null });
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },

  // Clear the session
  signOut: async () => {
    await storage.removeItem(STORAGE_KEYS.TOKEN);
    await storage.removeItem(STORAGE_KEYS.USER);
    set({ token: null, user: null, error: null });
  },

  clearError: () => set({ error: null }),

  // Update premium status locally + persist to storage
  updatePremium: async (isPremium, premiumPlan, premiumUntil) => {
    set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, isPremium, premiumPlan, premiumUntil };
      storage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
