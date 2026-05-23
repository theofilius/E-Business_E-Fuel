import { create } from 'zustand';
import { orderService } from '../services/orderService';
import { Order, OrderStatus } from '../types';

interface DriverState {
  availableOrders: Order[];
  myOrders: Order[];
  isOnline: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchAvailable: () => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  acceptOrder: (id: string) => Promise<Order>;
  updateStatus: (id: string, status: OrderStatus) => Promise<Order>;
  setOnline: (online: boolean) => void;

  // Helpers driven by realtime socket events
  applyOrderUpdate: (order: Order) => void;
  prependNewOrder: (order: Order) => void;
  dismissAvailable: (id: string) => void;
  reset: () => void;
}

const initial = {
  availableOrders: [] as Order[],
  myOrders: [] as Order[],
  isOnline: true,
  isLoading: false,
  isSubmitting: false,
  error: null as string | null,
};

export const useDriverStore = create<DriverState>((set, get) => ({
  ...initial,

  fetchAvailable: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await orderService.getAvailableOrders();
      set({ availableOrders: orders, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  fetchMyOrders: async () => {
    try {
      const orders = await orderService.getDriverOrders();
      set({ myOrders: orders });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  acceptOrder: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      const order = await orderService.acceptOrder(id);
      set((state) => ({
        isSubmitting: false,
        availableOrders: state.availableOrders.filter((o) => o._id !== id),
        myOrders: [order, ...state.myOrders.filter((o) => o._id !== id)],
      }));
      return order;
    } catch (e: any) {
      set({ isSubmitting: false, error: e.message });
      throw e;
    }
  },

  updateStatus: async (id, status) => {
    set({ isSubmitting: true, error: null });
    try {
      const order = await orderService.updateOrderStatus(id, status);
      set((state) => ({
        isSubmitting: false,
        myOrders: state.myOrders.map((o) => (o._id === id ? order : o)),
      }));
      return order;
    } catch (e: any) {
      set({ isSubmitting: false, error: e.message });
      throw e;
    }
  },

  setOnline: (online) => set({ isOnline: online }),

  // Update an order in-place when a realtime status change arrives
  applyOrderUpdate: (order) => {
    set((state) => ({
      myOrders: state.myOrders.map((o) => (o._id === order._id ? order : o)),
      availableOrders: state.availableOrders.filter((o) => o._id !== order._id),
    }));
  },

  prependNewOrder: (order) => {
    set((state) => {
      // Only show pending unassigned new orders
      if (order.status !== 'pending' || order.driverId) return state;
      if (state.availableOrders.some((o) => o._id === order._id)) return state;
      return { availableOrders: [order, ...state.availableOrders] };
    });
  },

  dismissAvailable: (id) => {
    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o._id !== id),
    }));
  },

  reset: () => set({ ...initial }),
}));
