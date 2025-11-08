export type SupportedLanguage = 'fr' | 'en' | 'de' | 'pt';

export interface Translation {
  title: string;
  description: string;
  materials?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Product {
  id: string;
  slug: string;
  translations: Record<SupportedLanguage, Translation>;
  priceCents: number;
  currency: 'EUR';
  stock: number;
  isActive: boolean;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  tags?: string[];
  cover_original?: string;
  cover_thumb?: string;
  gallery?: { original: string; thumb: string }[];
  dimensions?: { widthCm?: number; heightCm?: number; depthCm?: number };
  weightKg?: number;
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  publishedAt?: any;
  featured?: boolean;
  status: 'available' | 'sold' | 'made-to-order';
  yearCreated: number;
  certificateOfAuthenticity: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Address {
    id: string;
    userId: string;
    label?: string;
    name: string;
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

export interface Order {
    id: string;
    number: string;
    userId: string;
    items: {
        productId: string;
        title: string;
        qty: number;
        priceCents: number;
        currency: 'EUR';
        image_thumb?: string;
    }[];
    totals: {
        subtotalCents: number;
        shippingCents: number;
        discountCents: number;
        taxCents: number;
        totalCents: number;
        currency: 'EUR';
    };
    status: 'created' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
    timeline: { status: string; note?: string; at: any; by?: string }[];
    shippingAddress: Omit<Address, 'id' | 'userId' | 'isDefault' | 'createdAt' | 'updatedAt' >;
    createdAt: any; // Firestore Timestamp
    updatedAt: any;
}

export interface WishlistItem {
    productId: string;
    addedAt: any; // Firestore Timestamp
}

export interface Wishlist {
    items: WishlistItem[];
    updatedAt: any; // Firestore Timestamp
}