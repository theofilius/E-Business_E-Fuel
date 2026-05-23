// ===== User & Auth =====
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'driver';
  avatar?: string | null;
  // Driver-only fields:
  vehicle?: string | null;
  plateNumber?: string | null;
  rating?: number;
  isOnline?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: User & { token: string };
}

/** Subset of User returned when an Order populates `driverId`. */
export interface DriverSummary {
  _id: string;
  name: string;
  phone?: string;
  vehicle?: string | null;
  plateNumber?: string | null;
  rating?: number;
}

/** Subset of User returned when an Order populates `userId`. */
export interface CustomerSummary {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

// ===== Fuel =====
export type FuelType = 'IGNITE' | 'BLAZE' | 'QUANTUM' | 'DIESEL';

export interface FuelProduct {
  fuelType: FuelType;
  name: string;
  ron: string;
  pricePerLiter: number;
  serviceFee: number;
  currency: string;
}

// ===== Orders =====
export interface OrderLocation {
  address: string;
  coordinates: { lat: number; lng: number };
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way'
  | 'arrived'
  | 'fueling'
  | 'delivered'
  | 'cancelled';

export interface Order {
  _id: string;
  userId: string | CustomerSummary;
  driverId?: string | DriverSummary | null;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  totalPrice: number;
  serviceFee: number;
  location: OrderLocation;
  driverLocation?: { lat: number | null; lng: number | null } | null;
  status: OrderStatus;
  paymentMethod: 'cash' | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris' | 'bca' | 'bni' | 'mandiri' | 'bri';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentExpiry?: string | null;
  paymentRef?: string | null;
  notes?: string;
  estimatedArrival?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}
