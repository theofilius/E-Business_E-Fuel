import api from './api';
import { RefundRequest, RefundReason } from '../types';

export interface CreateRefundPayload {
  orderId: string;
  reason: RefundReason;
  description?: string;
}

export const refundService = {
  async createRefund(payload: CreateRefundPayload): Promise<RefundRequest> {
    const res = await api.post('/refunds', payload);
    return res.data.data;
  },

  async getMyRefunds(): Promise<RefundRequest[]> {
    const res = await api.get('/refunds/my');
    return res.data.data;
  },
};
