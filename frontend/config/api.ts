const DEFAULT_API_BASE_URL = 'http://192.168.1.153:5001';

const normalizeBaseUrl = (value?: string) => {
  const raw = value?.trim() || DEFAULT_API_BASE_URL;
  return raw.replace(/\/+$/, '').replace(/\/api$/, '');
};

export const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
export const API_URL = `${API_BASE_URL}/api`;
