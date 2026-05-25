import { Platform } from 'react-native';
import { storage, STORAGE_KEYS } from '../utils/storage';
import api from './api';
import { ChatMessage, ChatConversation } from '../types';

/** Returns the correct base URL for image assets (static uploads folder). */
const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:5001';
  return 'http://localhost:5001';
};

export const chatService = {
  /** GET /api/chat/orders/:orderId/messages */
  async getMessages(orderId: string): Promise<ChatConversation> {
    const res = await api.get<{ success: boolean; data: ChatConversation }>(
      `/chat/orders/${orderId}/messages`
    );
    return res.data.data;
  },

  /** POST /api/chat/orders/:orderId/messages */
  async sendMessage(orderId: string, text: string): Promise<ChatMessage> {
    const res = await api.post<{ success: boolean; data: ChatMessage }>(
      `/chat/orders/${orderId}/messages`,
      { text }
    );
    return res.data.data;
  },

  /** POST /api/chat/orders/:orderId/upload  (multipart/form-data) */
  async uploadImage(
    orderId: string,
    imageUri: string,
    imageName: string,
    mimeType: string
  ): Promise<ChatMessage> {
    const token = await storage.getItem(STORAGE_KEYS.TOKEN);

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: imageName,
      type: mimeType,
    } as any);

    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}/api/chat/orders/${orderId}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT set Content-Type — fetch auto-sets multipart/form-data with boundary
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal upload gambar');
    }
    const json = await res.json();
    return json.data as ChatMessage;
  },

  /** Resolve relative imageUrl to absolute URL. */
  resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${getBaseUrl()}${imageUrl}`;
  },
};
