import axios from 'axios';
import { Platform } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';

/**
 * Base URL of the E-FUEL backend API.
 * NOTE: backend runs on port 5001 (port 5000 is taken by macOS AirPlay Receiver).
 */
const getApiUrl = () => {
  // Android emulator reaches the host machine via 10.0.2.2
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001/api';
  return 'http://localhost:5001/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the JWT token to every outgoing request
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem(STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize backend / network errors into a single readable message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    let message = data?.message || error.message || 'Terjadi kesalahan.';

    // express-validator returns a list of field errors
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.map((e: any) => e.message).join('\n');
    }
    if (error.code === 'ECONNABORTED') {
      message = 'Koneksi timeout. Pastikan server backend berjalan.';
    }
    if (error.message === 'Network Error') {
      message = 'Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5001.';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
