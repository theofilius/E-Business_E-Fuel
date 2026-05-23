import { create } from 'zustand';
import { orderService, CreateOrderPayload } from '../services/orderService';
import { FuelProduct, Order, PaymentSession } from '../types';
import { paymentService } from '../services/paymentService';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  fuelProducts: FuelProduct[];
  isLoadingOrders: boolean;
  isLoadingPrices: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchFuelPrices: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  cancelOrder: (id: string) => Promise<void>;
  initiatePayment: (orderId: string) => Promise<PaymentSession>;
  confirmPayment: (orderId: string) => Promise<Order>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  fuelProducts: [],
  isLoadingOrders: false,
  isLoadingPrices: false,
  isSubmitting: false,
  error: null,

  // GET /api/orders/prices
  fetchFuelPrices: async () => {
    set({ isLoadingPrices: true });
    try {
      const products = await orderService.getFuelPrices();
      set({ fuelProducts: products, isLoadingPrices: false });
    } catch (err: any) {
      set({ isLoadingPrices: false, error: err.message });
    }
  },

  // GET /api/orders
  fetchOrders: async () => {
    set({ isLoadingOrders: true, error: null });
    try {
      const orders = await orderService.getMyOrders();
      set({ orders, isLoadingOrders: false });
    } catch (err: any) {
      set({ isLoadingOrders: false, error: err.message });
    }
  },

  // POST /api/orders
  createOrder: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const order = await orderService.createOrder(payload);
      set((state) => ({
        isSubmitting: false,
        currentOrder: order,
        orders: [order, ...state.orders],
      }));
      return order;
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },

  // PUT /api/orders/:id/cancel
  cancelOrder: async (id) => {
    try {
      const updated = await orderService.cancelOrder(id);
      set((state) => ({
        orders: state.orders.map((o) => (o._id === id ? updated : o)),
        currentOrder: state.currentOrder?._id === id ? updated : state.currentOrder,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  initiatePayment: async (orderId) => {
    set({ isSubmitting: true, error: null });
    try {
      const session = await paymentService.initiatePayment(orderId);
      set({ isSubmitting: false });
      return session;
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },

  confirmPayment: async (orderId) => {
    set({ isSubmitting: true, error: null });
    try {
      const order = await paymentService.confirmPayment(orderId);
      set((state) => ({
        isSubmitting: false,
        orders: state.orders.map((o) => (o._id === order._id ? order : o)),
        currentOrder: state.currentOrder?._id === order._id ? order : state.currentOrder,
      }));
      return order;
    } catch (err: any) {
      set({ isSubmitting: false, error: err.message });
      throw err;
    }
  },
}));
