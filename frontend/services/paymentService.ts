import api from './api';
import { Order, PaymentSession } from '../types';

export const paymentService = {
  async initiatePayment(orderId: string): Promise<PaymentSession> {
    const res = await api.post(`/payments/${orderId}/initiate`);
    return res.data.data;
  },

  async confirmPayment(orderId: string): Promise<Order> {
    const res = await api.post(`/payments/${orderId}/confirm`);
    return res.data.data;
  },

  async getPaymentStatus(orderId: string): Promise<{ paymentStatus: string; paymentExpiry: string; paymentRef: string; isExpired: boolean }> {
    const res = await api.get(`/payments/${orderId}/status`);
    return res.data.data;
  },
};
