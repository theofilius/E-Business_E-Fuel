export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User & { token: string };
}

export interface Driver {
  _id: string;
  name: string;
  vehicle: string;
  plateNumber: string;
  currentLocation: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  status: 'available' | 'busy' | 'offline';
  rating: number;
}

export interface Order {
  _id: string;
  userId: string;
  driverId?: string;
  fuelType: 'Pertalite' | 'Pertamax' | 'Pertamax Turbo' | 'Solar' | 'Dexlite';
  liters: number;
  totalPrice: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  status: 'pending' | 'accepted' | 'on_the_way' | 'arrived' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FuelPrice {
  type: string;
  pricePerLiter: number;
}
