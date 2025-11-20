import { Timestamp } from 'firebase/firestore';

// This enum uses the short codes consistent with the frontend Language type
export enum LanguageCode {
  FR = 'fr',
  EN = 'en',
  DE = 'de',
  PT = 'pt',
}

// --- USERS Collection ---
// Path: /users/{uid}
export interface UserPreferences {
  newsletter: boolean;
  orderNotifications: boolean;
  promotionalEmails: boolean;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number; // in cents
  wishlistCount: number;
}

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: 'customer' | 'admin';
  language: LanguageCode;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  emailVerified: boolean;
  preferences: UserPreferences;
  stats: UserStats;
  adminNotes?: string;
}


// --- PRODUCTS Collection ---
// Path: /products/{productId}
export interface ProductTranslation {
  title: string;
  description: string;
  materials: string;
}

export interface ProductImage {
  url: string;
  thumbnailUrl: string;
  alt: string;
  order: number;
}

export interface ProductPrice {
  amount: number; // in cents
  currency: 'EUR';
  compareAtPrice: number | null; // in cents
}

export interface ProductDimensions {
  height: number; // in cm
  width: number; // in cm
  depth: number; // in cm
}

export interface ProductDocument {
  id: string; // Firestore document ID
  sku: string;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  translations: {
    [key in LanguageCode]?: ProductTranslation;
  };
  images: ProductImage[];
  price: ProductPrice;
  dimensions: ProductDimensions | null;
  weight: number | null; // in kg
  yearCreated: number | null;
  status: 'available' | 'sold' | 'made-to-order';
  stock: number;
  certificateOfAuthenticity: boolean;
  tags: string[];
  keywords?: string[]; // For search functionality
  featured: boolean;
  views: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
}


// --- ORDERS Collection ---
// Path: /orders/{orderId}
export interface Address {
    recipientName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string; // ISO 3166-1 alpha-2 code
    phone?: string;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    snapshot: {
        title: string;
        imageUrl: string;
        price: number; // price per item in cents at time of purchase
    };
}

export interface OrderPricing {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    currency: 'EUR';
}

export interface OrderTracking {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderStatusHistory {
    status: OrderStatus;
    timestamp: Timestamp;
    note?: string;
}

export interface OrderDocument {
  id: string; // Firestore document ID
  orderNumber: string; // e.g., #1001
  userId: string;
  user?: { // Denormalized for quick access
      displayName: string;
      email: string;
  };
  status: OrderStatus;
  items: OrderItem[];
  pricing: OrderPricing;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string; // From Revolut, Stripe, etc.
  pixQrCode?: string;
  pixCopiaECola?: string;
  tracking?: OrderTracking;
  statusHistory: OrderStatusHistory[];
  language: LanguageCode;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}


// --- ADDRESSES Collection ---
// Path: /users/{uid}/addresses/{addressId}
export interface AddressDocument extends Address {
    id: string;
    userId: string;
    isDefault: boolean;
    type: 'shipping' | 'billing';
}


// --- WISHLIST Collection ---
// Path: /users/{uid}/wishlist/{productId}
export interface WishlistItemDocument {
    productId: string;
    addedAt: Timestamp;
    productSnapshot: Partial<ProductDocument>;
}

// --- CART Collection (for logged in users) ---
// Path: /users/{uid}/cart/{productId}
export interface CartItemDocument {
    productId: string;
    quantity: number;
    addedAt: Timestamp;
    productSnapshot: Partial<ProductDocument>; // To avoid re-fetching all details in cart view
}


// --- SETTINGS Collection ---
// Path: /settings/{settingId} (e.g., 'global')
export interface ShippingRegion {
    name: string;
    countries: string[]; // ISO 3166-1 alpha-2 codes
    cost: number; // in cents
}
export interface SettingsDocument {
    id: string;
    siteTitle: string;
    maintenanceMode: boolean;
    contactEmail: string;
    shippingRegions: ShippingRegion[];
    socialLinks?: {
        instagram?: string;
        facebook?: string;
    }
}


// --- DISCOUNT_CODES Collection ---
// Path: /discount_codes/{codeId}
export interface DiscountCodeDocument {
    id: string;
    code: string;
    type: 'percentage' | 'fixed_amount';
    value: number; // percentage (e.g., 10 for 10%) or fixed amount in cents
    minPurchase: number; // in cents
    expiresAt: Timestamp | null;
    isActive: boolean;
    usageLimit: number | null;
    timesUsed: number;
}


// --- NEWSLETTER_SUBSCRIBERS Collection ---
// Path: /newsletter_subscribers/{email}
export interface NewsletterSubscriberDocument {
    email: string;
    subscribedAt: Timestamp;
    language: LanguageCode;
    source: string;
}


// --- CONTACT_MESSAGES Collection ---
// Path: /contact_messages/{messageId}
export interface ContactMessageDocument {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;

    isRead: boolean;
    createdAt: Timestamp;
}