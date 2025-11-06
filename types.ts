// Este arquivo define a "forma" dos dados que usamos no site.
// Pense nisso como um contrato: se um objeto é um "Produto", ele TEM que ter
// as propriedades definidas aqui (id, sku, category, etc.). Isso ajuda a evitar erros.

// Idiomas suportados no site.
export type Language = 'fr' | 'en' | 'de' | 'pt';

// Estrutura para os textos de um produto em um idioma específico.
export interface ProductTranslation {
  title: string;
  description: string;
  materials: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Estrutura para uma imagem de produto.
export interface ProductImage {
  url: string;
  alt: string;
  order: number;
}

// A estrutura completa de um produto, baseada no schema do Firestore que você definiu.
export interface Product {
  id: string;
  sku: string;
  category: 'paintings' | 'jewelry' | 'digital' | 'prints';
  translations: {
    [key in Language]: ProductTranslation;
  };
  images: ProductImage[];
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
  createdAt: string; // Usando string para simplificar, no Firebase seria um Timestamp
  updatedAt: string;
  publishedAt?: string | null;
}

// Tipos para os filtros do catálogo.
export interface Filters {
  category: string;
  priceRange: [number, number];
  availability: string;
}

// Representa um item dentro do carrinho de compras.
export interface CartItem {
  id: string; // ID do produto
  slug: string; // Slug para o link
  title: string; // Título no idioma atual do usuário
  image: string; // URL da imagem principal
  price: number; // Preço unitário
  quantity: number; // Quantidade selecionada
  stock: number; // Estoque disponível (para limitar a quantidade)
}

// Representa o estado do carrinho de compras.
export interface CartState {
  items: CartItem[];
}

// Define o tipo de uma notificação (toast).
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Define as preferências de notificação do usuário.
export interface UserPreferences {
    orderUpdates: boolean;
    promotions: boolean;
    newArtworks: boolean;
}

// Representa os dados do usuário que salvamos no Firestore.
export interface UserData {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    role: 'customer' | 'admin';
    language: Language;
    createdAt: any; // Firestore Timestamp
    preferences: UserPreferences;
}

// Define o que o Contexto de Autenticação vai fornecer.
export interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    refetchUser: () => Promise<void>;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}