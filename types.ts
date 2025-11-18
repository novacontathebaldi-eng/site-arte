import { User } from 'firebase/auth';

export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
  timestamp: Date;
}

export type UserProfile = User & {
  role?: 'customer' | 'admin';
  language?: 'fr' | 'en' | 'de' | 'pt';
  createdAt?: Date;
  lastLogin?: Date;
  preferences?: {
    newsletter?: boolean;
    orderNotifications?: boolean;
    promotionalEmails?: boolean;
    currency?: 'EUR';
  };
  stats?: {
    totalOrders?: number;
    totalSpent?: number;
    wishlistCount?: number;
  };
};

export interface Image {
  url: string;
  thumbnail: string;
  alt: string;
  order: number;
}

export interface Product {
  id: string;
  sku: string;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  translations: {
    [key in 'fr' | 'en' | 'de' | 'pt']: {
      title: string;
      description: string;
      materials: string;
      metaTitle?: string;
      metaDescription?: string;
    };
  };
  images: Image[];
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
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
  publishedAt?: Date | null;
  seo?: {
    slug: string;
    canonical?: string | null;
  };
}


export interface AccordionItem {
  title: string;
  content: React.ReactNode;
}
