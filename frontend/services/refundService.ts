import api from './api';
import { RefundRequest, RefundReason } from '../types';

export interface CreateRefundPayload {
  orderId: string;
  reason: RefundReason;
  description?: string;
}

export interface ProcessRefundPayload {
  status: 'approved' | 'rejected';
  adminNote?: string;
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

  // Admin: get all refunds
  async getAllRefunds(): Promise<RefundRequest[]> {
    const res = await api.get('/admin/refunds');
    return res.data.data;
  },

  // Admin: approve or reject a refund
  async processRefund(id: string, payload: ProcessRefundPayload): Promise<RefundRequest> {
    const res = await api.patch(`/admin/refunds/${id}`, payload);
    return res.data.data;
  },
};
