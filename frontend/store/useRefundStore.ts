import { create } from 'zustand';
import { refundService, CreateRefundPayload } from '../services/refundService';
import { RefundRequest } from '../types';

interface RefundState {
  refunds: RefundRequest[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchMyRefunds: () => Promise<void>;
  submitRefund: (payload: CreateRefundPayload) => Promise<RefundRequest>;
  clearError: () => void;

  /** Returns refund for a given orderId, or undefined */
  getRefundByOrderId: (orderId: string) => RefundRequest | undefined;
}

export const useRefundStore = create<RefundState>((set, get) => ({
  refunds: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMyRefunds: async () => {
    set({ isLoading: true, error: null });
    try {
      const refunds = await refundService.getMyRefunds();
      set({ refunds, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  submitRefund: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const refund = await refundService.createRefund(payload);
      set((state) => ({
        isSubmitting: false,
        refunds: [refund, ...state.refunds],
      }));
      return refund;
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  getRefundByOrderId: (orderId) =>
    get().refunds.find((r) => {
      const id = typeof r.orderId === 'string' ? r.orderId : r.orderId._id;
      return id === orderId;
    }),
}));
