import { create } from 'zustand';
import { Order, FuelPrice } from '../types';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  fuelPrices: FuelPrice[];
  isLoading: boolean;
  
  fetchOrders: () => Promise<void>;
  createOrder: (data: Partial<Order>) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  currentOrder: null,
  fuelPrices: [
    { type: 'E-FUEL IGNITE (RON 92)', pricePerLiter: 10000 },
    { type: 'E-FUEL BLAZE (RON 95)', pricePerLiter: 14000 },
    { type: 'E-FUEL QUANTUM (RON 98)', pricePerLiter: 16500 },
  ],
  isLoading: false,

  fetchOrders: async () => {
    set({ isLoading: true });
    // Fake fetch
    setTimeout(() => {
      set({ isLoading: false, orders: [] });
    }, 1000);
  },

  createOrder: async (data: Partial<Order>) => {
    set({ isLoading: true });
    // Fake create
    setTimeout(() => {
      const newOrder = {
        _id: Math.random().toString(),
        userId: "1",
        fuelType: data.fuelType || 'Pertalite',
        liters: data.liters || 0,
        totalPrice: data.totalPrice || 0,
        location: data.location || { type: 'Point', coordinates: [0, 0], address: '' },
        status: 'pending' as const,
        createdAt: new Date().toISOString()
      };
      set((state) => ({ 
        isLoading: false, 
        currentOrder: newOrder,
        orders: [newOrder, ...state.orders]
      }));
    }, 1000);
  }
}));
