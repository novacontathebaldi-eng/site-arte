export enum ProductCategory {
  ALL = 'all',
  PAINTINGS = 'paintings',
  JEWELRY = 'jewelry',
  DIGITAL = 'digital',
  PRINTS = 'prints',
  SCULPTURES = 'sculptures'
}

export interface ProductTranslation {
  title: string;
  description: string;
  material?: string;
}

export interface Product {
  id: string;
  translations: {
    [key: string]: ProductTranslation; // 'fr' | 'en' | 'de' | 'pt'
  };
  price: number;
  category: ProductCategory;
  images: string[];
  available: boolean; // Legacy support
  status: 'available' | 'sold' | 'reserved';
  stock: number;
  dimensions?: string;
  featured?: boolean;
  createdAt: string; // ISO String
}

export interface CartItem extends Product {
  quantity: number;
}
