// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  role: 'customer' | 'admin';
  language: 'fr' | 'en' | 'de' | 'pt';
  createdAt: Date;
  lastLogin: Date;
  emailVerified: boolean;
  preferences: {
    newsletter: boolean;
    orderNotifications: boolean;
    promotionalEmails: boolean;
    currency: string;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
  };
}

// Product Types
export interface Product {
  id: string;
  sku: string;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  translations: {
    fr: ProductTranslation;
    en: ProductTranslation;
    de: ProductTranslation;
    pt: ProductTranslation;
  };
  images: ProductImage[];
  price: {
    amount: number;
    currency: string;
    compareAtPrice?: number;
  };
  dimensions: {
    height: number;
    width: number;
    depth?: number;
  };
  weight: number;
  yearCreated: number;
  status: 'available' | 'sold' | 'made-to-order';
  stock: number;
  certificateOfAuthenticity: boolean;
  tags: string[];
  slug: string;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  seo?: {
    slug: string;
    canonical?: string;
  };
}

export interface ProductTranslation {
  title: string;
  description: string;
  materials: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductImage {
  url: string;
  thumbnail: string;
  alt: string;
  order: number;
  sizes?: {
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  };
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  pricing: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  };
  discountCode?: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: {
    name: 'Standard' | 'Express' | 'Local Pickup';
    cost: number;
    estimatedDays: number;
  };
  paymentMethod: {
    type: 'card' | 'paypal' | 'pix' | 'bank-transfer';
    last4?: string;
    brand?: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentIntentId?: string;
  tracking?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  statusHistory: OrderStatusHistory[];
  customerNotes?: string;
  adminNotes?: string;
  language: 'fr' | 'en' | 'de' | 'pt';
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'in-transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  productSnapshot: {
    title: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

// Address Types
export interface Address {
  recipientName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Cart {
  items: CartItem[];
  updatedAt: Date;
  expiresAt: Date;
}

// Wishlist Types
export interface WishlistItem {
  productId: string;
  addedAt: Date;
}

export interface Wishlist {
  items: WishlistItem[];
  updatedAt: Date;
}

// Settings Types
export interface Settings {
  general: {
    siteName: string;
    artistName: string;
    artistNickname: string;
    logo?: string;
    favicon?: string;
    defaultLanguage: 'fr' | 'en' | 'de' | 'pt';
    enabledLanguages: ('fr' | 'en' | 'de' | 'pt')[];
    currency: string;
    timezone: string;
  };
  content: {
    translations: {
      fr: ContentTranslation;
      en: ContentTranslation;
      de: ContentTranslation;
      pt: ContentTranslation;
    };
  };
  contact: {
    email: string;
    phone?: string;
    address?: string;
    studioLocation: string;
    socialMedia: {
      instagram: string;
      facebook?: string;
      pinterest?: string;
      twitter?: string;
    };
  };
  ecommerce: {
    shippingRegions: ShippingRegion[];
    paymentMethods: {
      creditCard: boolean;
      debitCard: boolean;
      paypal: boolean;
      pix: boolean;
      bankTransfer: boolean;
    };
    taxRates: {
      [key: string]: number;
    };
  };
  design: {
    colors: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  seo: {
    googleAnalyticsId?: string;
    facebookPixelId?: string;
    siteVerification: {
      google?: string;
      bing?: string;
    };
  };
  notifications: {
    orderEmail: string;
    contactEmail: string;
    emailProvider: 'brevo' | 'mailgun';
    emailApiKey?: string;
  };
}

export interface ContentTranslation {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  metaTitle: string;
  metaDescription: string;
}

export interface ShippingRegion {
  name: string;
  code?: string;
  countries?: string[];
  rates: {
    standard: number;
    express: number;
  };
  estimatedDays: {
    standard: number;
    express: number;
  };
}

// Discount Code Types
export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: Date;
  validUntil?: Date;
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

// Contact Message Types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  productReference?: string;
  message: string;
  attachments?: string[];
  language: 'fr' | 'en' | 'de' | 'pt';
  status: 'unread' | 'read' | 'replied' | 'archived';
  repliedAt?: Date;
  repliedBy?: string;
  createdAt: Date;
  ipAddress: string;
}

// Newsletter Types
export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: 'fr' | 'en' | 'de' | 'pt';
  source: 'checkout' | 'footer' | 'contact';
  confirmedAt?: Date;
  unsubscribedAt?: Date;
  subscribedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cart Types
export interface CartState {
  items: CartItem[];
  isLoading: boolean;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  getItemCount: () => number;
}

// Auth Types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Chatbot Types
export interface ChatbotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotState {
  messages: ChatbotMessage[];
  isOpen: boolean;
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  toggleChat: () => void;
  clearMessages: () => void;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  image?: string;
  url: string;
  type: 'website' | 'article' | 'product';
  locale: string;
  siteName: string;
}