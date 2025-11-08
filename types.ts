
// Este arquivo define a "forma" dos dados que usamos no site.
// Pense nisso como um contrato: se um objeto é um "Produto", ele TEM que ter
// as propriedades definidas aqui (id, sku, category, etc.). Isso ajuda a evitar erros.
export interface User {
  id: string;
  email?: string;
  user_metadata: {
    [key: string]: any;
    display_name?: string;
    avatar_url?: string;
  };
  created_at: string;
  email_confirmed_at?: string;
}

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
  createdAt: string; // Usando string para simplificar
  updatedAt: string;
  publishedAt?: string | null;
}

// Tipos para os filtros do catálogo.
export interface Filters {
  query: string;
  category: string;
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

// Representa os dados do perfil do usuário na tabela 'profiles' do Supabase.
export interface Profile {
    id: string; // Corresponde ao user.id do Supabase Auth
    display_name: string | null;
    photo_url?: string | null;
    phone?: string | null;
    role: 'customer' | 'admin';
    language: Language;
    updated_at: string;
    preferences: UserPreferences;
}

// Combina o usuário do Supabase Auth com o perfil do banco de dados.
export type UserData = User & { profile: Profile | null };


// Define o que o Contexto de Autenticação vai fornecer.
export interface AuthContextType {
    user: UserData | null;
    loading: boolean;
    refetchUser: () => Promise<void>;
    updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
}

// --- TIPOS PARA PEDIDOS (ORDERS) ---

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Address {
    recipientName: string;
    company?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state?: string | null;
    postalCode: string;
    country: string;
    phone: string;
    isDefault: boolean;
}

export interface AddressWithId extends Address {
    id: string;
}


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
    };
    shippingAddress: Address;
    paymentMethod: {
        type: 'card' | 'paypal' | 'pix';
        last4?: string | null;
        brand?: string | null;
    };
    paymentStatus: PaymentStatus;
    statusHistory: {
        status: OrderStatus;
        timestamp: string;
        note?: string | null;
    }[];
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string | null;
}

// --- TIPOS PARA WISHLIST ---

export interface WishlistItem {
    productId: string;
    addedAt: string;
}

export interface Wishlist {
    userId: string;
    items: WishlistItem[];
}

// --- TIPOS PARA DASHBOARD ---
export interface DashboardStats {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
}

// --- TIPOS PARA CHECKOUT ---
export type CheckoutStep = 'address' | 'payment' | 'review';

// --- TIPOS PARA O NOVO PRODUCT SERVICE (SUPABASE) ---

export interface ProductFilters {
  category?: string[];
  minPrice?: number;
  maxPrice?: number;
  technique?: string[];
  sizeMin?: number;
  sizeMax?: number;
  yearMin?: number;
  yearMax?: number;
  available?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}

export interface SupabaseProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: { [key in Language]?: string };
  is_primary: boolean;
  order: number;
}

export interface SupabaseProductDimension {
  id: string;
  product_id: string;
  width: number;
  height: number;
  depth: number | null;
  unit: 'cm' | 'inches';
}

export interface SupabaseProduct {
  id: string;
  title: { [key in Language]?: string };
  description: { [key in Language]?: string };
  price: number;
  currency: string;
  category: 'Painting' | 'Sculpture' | 'Drawing' | 'Print';
  technique: string[];
  featured: boolean;
  available: boolean;
  year: number;
  rating: number;
  created_at: string;
  updated_at: string;
  product_images?: SupabaseProductImage[];
  product_dimensions?: SupabaseProductDimension[];
}
