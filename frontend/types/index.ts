// ===== User & Auth =====
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'driver';
  address?: string | null;
  avatar?: string | null;
  // Premium fields:
  isPremium?: boolean;
  premiumPlan?: string | null;
  premiumUntil?: string | null;
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

// ===== Refund =====
export type RefundReason =
  | 'Bensin Tidak Datang Lebih dari 15 Menit'
  | 'Volume Tidak Sesuai'
  | 'Jenis BBM Tidak Sesuai'
  | 'Lainnya';

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';

export interface RefundRequest {
  _id: string;
  orderId: string | Order;
  userId: string | { _id: string; name: string; email: string };
  reason: RefundReason;
  description: string;
  status: RefundStatus;
  amount: number;
  driverName?: string | null;
  fuelType?: string | null;
  liters?: number | null;
  // Admin processing fields
  adminNote?: string | null;
  processedBy?: string | { _id: string; name: string } | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// ===== Chat =====
export interface ChatMessage {
  _id: string;
  conversationId: string;
  orderId: string;
  senderId: { _id: string; name: string; role: string } | string;
  senderRole: 'customer' | 'driver' | 'admin';
  type: 'text' | 'image';
  text?: string | null;
  imageUrl?: string | null;
  imageName?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatConversation {
  conversationId: string;
  messages: ChatMessage[];
}

// ===== Payment =====
export interface PaymentSession {
  orderId: string;
  paymentMethod: Order['paymentMethod'];
  amount: number;
  paymentRef: string;
  paymentExpiry: string;
  /** Data QR code (URL atau teks) untuk e-wallet / QRIS */
  qrData?: string | null;
  virtualAccount?: string | null;
  deepLink?: string | null;
  instructions?: string[];
}
