import api from './api';
import { User } from '../types';

type AuthData = User & { token: string };

/**
 * Auth API calls — talks to the E-FUEL backend (/api/auth).
 */
export const authService = {
  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<AuthData> {
    const res = await api.post('/auth/register', payload);
    return res.data.data;
  },

  async login(email: string, password: string): Promise<AuthData> {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/profile');
    return res.data.data;
  },

  async updateProfile(payload: Partial<User> & { password?: string }): Promise<User> {
    const res = await api.put('/auth/profile', payload);
    return res.data.data;
  },
};
