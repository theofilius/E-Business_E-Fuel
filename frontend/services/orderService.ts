import api from './api';
import { FuelProduct, Order, OrderStatus } from '../types';

export interface CreateOrderPayload {
  fuelType: string;
  liters: number;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  paymentMethod?: 'cash' | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris' | 'bca' | 'bni' | 'mandiri' | 'bri';
  notes?: string;
}

/** Order API calls — talks to the E-FUEL backend (/api/orders). */
export const orderService = {
  // ----- Customer -----
  async getFuelPrices(): Promise<FuelProduct[]> {
    const res = await api.get('/orders/prices');
    return res.data.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post('/orders', payload);
    return res.data.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get('/orders');
    return res.data.data;
  },

  async getOrderById(id: string): Promise<Order> {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  async cancelOrder(id: string): Promise<Order> {
    const res = await api.put(`/orders/${id}/cancel`);
    return res.data.data;
  },

  // ----- Driver -----
  async getAvailableOrders(): Promise<Order[]> {
    const res = await api.get('/orders/available');
    return res.data.data;
  },

  async getDriverOrders(): Promise<Order[]> {
    const res = await api.get('/orders/driver');
    return res.data.data;
  },

  async acceptOrder(id: string): Promise<Order> {
    const res = await api.put(`/orders/${id}/accept`);
    return res.data.data;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data.data;
  },
};
