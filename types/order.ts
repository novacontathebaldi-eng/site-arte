
import { CartItem } from './product';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  amount: number;
  currency: string;
  status: OrderStatus;
  shippingAddress: {
    recipientName: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  tracking?: {
    carrier: string;
    code: string;
    url?: string;
    sentAt?: string;
  };
  customerEmail?: string; // Optional snapshot for email sending
  customerName?: string;  // Optional snapshot
  createdAt: string;
  updatedAt: string;
}
