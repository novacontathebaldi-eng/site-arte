import { mockOrders, mockAddresses, mockWishlist } from '../lib/mockData';
import { Product, Order, Address, AddressWithId, Wishlist, DashboardStats, CartItem, Language } from '../types';
import { supabase } from '../lib/supabase';

const API_DELAY = 500; // Atraso mantido para simular a latência da rede em algumas operações.

// ===================================================================================
// FUNÇÕES DA API DE PRODUTOS
// ===================================================================================

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products from Supabase:", error.message);
    throw error;
  }
  return data as Product[];
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error.message);
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Product;
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching product with slug ${slug}:`, error.message);
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Product;
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching featured products:", error.message);
        throw error;
    }
    return data as Product[];
};

export const upsertProduct = async (productData: Partial<Product>): Promise<Product> => {
    const { data, error } = await supabase
        .from('products')
        .upsert(productData)
        .select()
        .single();
    
    if (error) {
        console.error("Error upserting product:", error);
        throw error;
    }
    return data as Product;
};

export const deleteProduct = async (id: string, imageUrls: string[]): Promise<void> => {
    // Primeiro, deleta as imagens do storage
    if (imageUrls.length > 0) {
        await deleteProductImages(imageUrls);
    }
    // Depois, deleta o produto do banco de dados
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

// ===================================================================================
// FUNÇÕES DA API DE STORAGE (IMAGENS)
// ===================================================================================

const getPathFromUrl = (url: string) => {
    try {
        const urlObject = new URL(url);
        // O path no Supabase Storage geralmente começa depois do nome do bucket.
        // Ex: https://.../storage/v1/object/public/BUCKET_NAME/path/to/file.jpg
        const parts = urlObject.pathname.split('/public/');
        return parts[1];
    } catch (error) {
        console.error("Invalid URL for storage path extraction:", url);
        return null;
    }
}

export const uploadProductImages = async (files: File[], productId: string): Promise<{ url: string; alt: string; order: number }[]> => {
    const uploadPromises = files.map(async (file, index) => {
        const filePath = `product-images/${productId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
            .from('STORAGE-ARTE') // Nome do seu bucket
            .upload(filePath, file);

        if (error) {
            console.error("Error uploading image:", error);
            throw error;
        }

        const { data } = supabase.storage
            .from('STORAGE-ARTE')
            .getPublicUrl(filePath);

        return { url: data.publicUrl, alt: file.name, order: index + 1 };
    });
    return Promise.all(uploadPromises);
};

export const deleteProductImages = async (imageUrls: string[]): Promise<void> => {
    const pathsToDelete = imageUrls.map(getPathFromUrl).filter(p => p !== null) as string[];
    if (pathsToDelete.length === 0) return;
    
    const { error } = await supabase.storage
        .from('STORAGE-ARTE')
        .remove(pathsToDelete);

    if (error) {
        console.error("Error deleting images:", error);
        throw error;
    }
};


// ===================================================================================
// FUNÇÕES MOCK (A SEREM SUBSTITUÍDAS)
// ===================================================================================

export const getOrdersByUserId = (userId: string): Promise<Order[]> => {
    return new Promise(resolve => setTimeout(() => resolve([]), API_DELAY));
};

export const getOrderById = (orderId: string): Promise<Order | undefined> => {
    return new Promise(resolve => resolve(mockOrders.find(o => o.id === orderId)));
};

export const getAddresses = (userId: string): Promise<AddressWithId[]> => {
  return new Promise(resolve => setTimeout(() => resolve([]), API_DELAY));
};

export const addAddress = (userId: string, address: Address): Promise<AddressWithId> => {
  return new Promise(resolve => setTimeout(() => resolve({ ...address, id: `addr-${Date.now()}` }), API_DELAY));
};

export const updateAddress = (userId: string, addressId: string, address: Address): Promise<AddressWithId> => {
  return new Promise(resolve => setTimeout(() => resolve({ ...address, id: addressId }), API_DELAY));
};

export const deleteAddress = (userId: string, addressId: string): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, API_DELAY));
};

export const getWishlist = (userId: string): Promise<Wishlist> => {
    return new Promise(resolve => setTimeout(() => resolve({ userId, items: [] }), API_DELAY));
};

export const updateWishlist = (userId: string, wishlist: Wishlist): Promise<Wishlist> => {
    return new Promise(resolve => setTimeout(() => resolve({ ...wishlist }), API_DELAY));
}

export const getUserDashboardStats = (userId: string): Promise<DashboardStats> => {
    return new Promise(resolve => setTimeout(() => resolve({ totalOrders: 0, totalSpent: 0, wishlistCount: 0 }), API_DELAY));
}

export const placeOrder = (userId: string, items: CartItem[], shippingAddress: Address): Promise<{ orderId: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({ orderId: `mock-order-${Date.now()}` }), API_DELAY));
};