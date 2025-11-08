export type SupportedLanguage = 'fr' | 'en' | 'de' | 'pt';

export interface Translation {
  title: string;
  description: string;
  materials: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Product {
  id: string;
  sku: string;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  translations: {
    [key in SupportedLanguage]: Translation;
  };
  images: {
    url: string;
    alt: string;
    order: number;
    thumbnail: string;
  }[];
  price: {
    amount: number;
    currency: 'EUR';
    compareAtPrice?: number | null;
  };
  dimensions: {
    height: number;
    width: number;
    depth?: number | null;
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
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
  publishedAt?: any | null; // Firestore Timestamp
}


export interface CartItem extends Product {
    quantity: number;
}

export interface Address {
    id: string;
    recipientName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    items: {
        productId: string;
        productSnapshot: {
            title: string;
            image: string;
            price: number;
        };
        quantity: number;
        subtotal: number;
    }[];
    pricing: {
        subtotal: number;
        shipping: number;
        total: number;
    };
    shippingAddress: Omit<Address, 'id' | 'isDefault'>;
    createdAt: any; // Firestore Timestamp
}