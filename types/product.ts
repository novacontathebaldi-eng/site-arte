
export enum ProductCategory {
  PAINTINGS = 'paintings',
  SCULPTURES = 'sculptures',
  JEWELRY = 'jewelry',
  DIGITAL = 'digital',
  PRINTS = 'prints',
  PHOTOGRAPHY = 'photography'
}

export interface ProductDimensions {
  height: number;
  width: number;
  depth: number;
  unit: 'cm' | 'in';
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isThumbnail: boolean;
}

export interface ProductTranslation {
  title: string;
  description: string;
  material_label: string; // Ex: "Oil on Canvas" vs "Óleo sobre Tela"
  seo_title?: string;
  seo_description?: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  
  // Status & Commerce
  price: number;
  stock: number;
  category: ProductCategory;
  status: 'active' | 'draft' | 'sold' | 'reserved';
  featured: boolean;
  displayOrder: number;

  // Art Specs
  dimensions: ProductDimensions;
  weight: number; // kg
  medium: string; // Técnica principal (para filtro)
  year: number;
  framing: 'framed' | 'unframed' | 'not_applicable';
  authenticity_certificate: boolean;
  signature: boolean;

  // Content
  translations: {
    [key: string]: ProductTranslation; // 'fr' | 'en' | 'de' | 'pt'
  };
  tags: string[];
  
  // Media
  images: ProductImage[];
  
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
