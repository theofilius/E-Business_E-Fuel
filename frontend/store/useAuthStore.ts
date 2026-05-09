import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types';

// Web-safe storage helper
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  
  restoreToken: () => Promise<void>;
  signIn: (email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (name: string, email: string, password?: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,

  restoreToken: async () => {
    try {
      const userToken = await storage.getItem('userToken');
      const userStr = await storage.getItem('userData');
      let userData = null;
      if (userStr) userData = JSON.parse(userStr);
      set({ token: userToken || null, user: userData, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      // Mock implementation: Accept any login for now
      const fakeToken = "fake-jwt-token";
      const userData = await storage.getItem('userData');
      let fakeUser: User;
      
      if (userData) {
        fakeUser = JSON.parse(userData);
      } else {
        fakeUser = {
          _id: "1",
          name: email.split('@')[0] || "User",
          email: email,
          phone: "081234567890",
          role: "customer",
          createdAt: new Date().toISOString()
        };
      }

      await storage.setItem('userToken', fakeToken);
      await storage.setItem('userData', JSON.stringify(fakeUser));
      
      // Artificial delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ token: fakeToken, user: fakeUser, isSignout: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    await storage.deleteItem('userToken');
    set({ isSignout: true, token: null, user: null, isLoading: false });
  },

  signUp: async (name: string, email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const fakeToken = "fake-jwt-token";
      const fakeUser: User = {
        _id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        phone: "081234567890",
        role: "customer",
        createdAt: new Date().toISOString()
      };

      await storage.setItem('userToken', fakeToken);
      await storage.setItem('userData', JSON.stringify(fakeUser));
      
      // Artificial delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set({ token: fakeToken, user: fakeUser, isSignout: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));
