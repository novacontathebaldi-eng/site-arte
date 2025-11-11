
import { User } from 'firebase/auth';

export type Language = 'fr' | 'en' | 'de' | 'pt';

// FIX: Added ProductStatus type
export type ProductStatus = 'available' | 'sold' | 'madeToOrder';

export interface ProductTranslation {
  title: string;
  description: string;
  materials: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ProductImage {
  original: string;
  thumb: string;
  alt?: string;
}

export interface Product {
  id: string;
  slug: string;
  translations: {
    [key in Language]?: ProductTranslation;
  };
  priceCents: number;
  currency: 'EUR' | 'USD' | 'BRL';
  stock: number;
  isActive: boolean;
  // FIX: Added status property to Product
  status: ProductStatus;
  categories?: string[];
  tags?: string[];
  cover_original?: string;
  cover_thumb?: string;
  gallery?: ProductImage[];
  dimensions?: {
    widthCm?: number;
    heightCm?: number;
    depthCm?: number;
  };
  weightKg?: number;
  attributes?: Record<string, string | number | boolean>;
  createdAt: { seconds: number, nanoseconds: number };
  updatedAt: { seconds: number, nanoseconds: number };
  featured?: boolean;
}

export interface Category {
    id: string;
    translations: {
        [key in Language]?: {
            name: string;
        }
    };
}


export interface Filters {
  query: string;
  category: string;
  availability: string;
}

export interface CartItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
}

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface UserPreferences {
  marketing?: boolean;
  orderUpdates?: boolean;
  promotions?: boolean;
  newArtworks?: boolean;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    phone?: string;
    language: Language;
    role: 'user' | 'admin';
    photoURL?: string;
    avatar_url_original?: string;
    avatar_url_thumb?: string;
    preferences?: UserPreferences;
    currency?: 'EUR' | 'USD' | 'BRL';
    stats?: {
        ordersCount: number;
        spentCents: number;
    };
    createdAt: any; // Firestore Timestamp
    lastLogin?: any; // Firestore Timestamp
    emailVerified: boolean;
}

export type UserData = User & { profile: UserProfile | null };

export interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

// --- TIPOS PARA PEDIDOS (ORDERS) ---

export type OrderStatus = 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'pix' | 'card' | 'cash' | 'bank';

export interface Address {
    id?: string;
    userId: string;
    label?: string;
    name: string;
    // FIX: Add optional company field to Address type
    company?: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface AddressWithId extends Address {
    id: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  qty: number;
  priceCents: number;
  currency: 'EUR' | 'USD' | 'BRL';
  image_thumb?: string;
}

export interface Order {
  id: string;
  // FIX: Add orderNumber to Order type
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totals: {
    subtotalCents: number;
    shippingCents: number;
    discountCents: number;
    taxCents: number;
    totalCents: number;
    currency: 'EUR' | 'USD' | 'BRL';
  };
  status: OrderStatus;
  timeline: {
    status: OrderStatus | string;
    note?: string;
    at: any; // Firestore Timestamp
  }[];
  payment?: {
    method: PaymentMethod;
    status: PaymentStatus;
    txnId?: string;
  };
  shipping?: {
    carrier?: string;
    trackingCode?: string;
    status?: string;
    deliveredAt?: any; // Firestore Timestamp
    events?: any[];
  };
  billingAddress: Address;
  shippingAddress: Address;
  documents?: { path: string; bucket: string; name: string }[];
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}


export interface WishlistItem {
  productId: string;
  addedAt: any; // Firestore Timestamp
}

export interface Wishlist {
  userId: string;
  items: WishlistItem[];
}

export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
}

export type CheckoutStep = 'address' | 'payment' | 'review';