
import { Order, Address, AddressWithId, Wishlist, DashboardStats, CartItem, Language, Product } from '../types';
import { supabase } from '../lib/supabase';

const API_DELAY = 500; // Atraso mantido para simular a latência da rede em algumas operações.

// ===================================================================================
// FUNÇÕES DA API DE PRODUTOS
// ===================================================================================

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('createdAt', { ascending: false });

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
        .order('createdAt', { ascending: false });

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
// FUNÇÕES DA API - DADOS DO USUÁRIO E PEDIDOS
// ===================================================================================

// FIX: Implemented missing address, wishlist, stats, and order functions using Supabase.
export const getAddresses = async (userId: string): Promise<AddressWithId[]> => {
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false });

  if (error) {
    console.error("Error fetching addresses:", error);
    throw error;
  }
  
  return data.map((addr: any) => ({
    id: addr.id,
    recipientName: addr.recipient_name,
    company: addr.company,
    addressLine1: addr.address_line_1,
    addressLine2: addr.address_line_2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
    phone: addr.phone,
    isDefault: addr.is_default
  }));
};

export const addAddress = async (userId: string, address: Address): Promise<AddressWithId> => {
  if (address.isDefault) {
    const { error: updateError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);
    if (updateError) {
      console.error("Error unsetting other default addresses:", updateError);
      throw updateError;
    }
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: userId,
      recipient_name: address.recipientName,
      company: address.company,
      address_line_1: address.addressLine1,
      address_line_2: address.addressLine2,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country,
      phone: address.phone,
      is_default: address.isDefault,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding address:", error);
    throw error;
  }
  
  const addr = data;
  return {
    id: addr.id,
    recipientName: addr.recipient_name,
    company: addr.company,
    addressLine1: addr.address_line_1,
    addressLine2: addr.address_line_2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
    phone: addr.phone,
    isDefault: addr.is_default
  };
};

export const updateAddress = async (userId: string, addressId: string, address: Address): Promise<AddressWithId> => {
  if (address.isDefault) {
    const { error: updateError } = await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId)
      .neq('id', addressId);
    if (updateError) {
      console.error("Error unsetting other default addresses:", updateError);
      throw updateError;
    }
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({
      recipient_name: address.recipientName,
      company: address.company,
      address_line_1: address.addressLine1,
      address_line_2: address.addressLine2,
      city: address.city,
      state: address.state,
      postal_code: address.postalCode,
      country: address.country,
      phone: address.phone,
      is_default: address.isDefault,
    })
    .eq('id', addressId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error);
    throw error;
  }

  const addr = data;
  return {
    id: addr.id,
    recipientName: addr.recipient_name,
    company: addr.company,
    addressLine1: addr.address_line_1,
    addressLine2: addr.address_line_2,
    city: addr.city,
    state: addr.state,
    postalCode: addr.postal_code,
    country: addr.country,
    phone: addr.phone,
    isDefault: addr.is_default
  };
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

    if (error) {
        console.error("Error deleting address:", error);
        throw error;
    }
};

export const getWishlist = async (userId: string): Promise<Wishlist> => {
    const { data, error } = await supabase
        .from('wishlists')
        .select('items')
        .eq('user_id', userId)
        .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore not found error
        console.error("Error fetching wishlist:", error);
        throw error;
    }

    if (!data) {
        return { userId, items: [] };
    }

    return { userId, items: data.items || [] };
};

export const updateWishlist = async (userId: string, wishlist: Wishlist): Promise<Wishlist> => {
    const { data, error } = await supabase
        .from('wishlists')
        .upsert({ user_id: userId, items: wishlist.items }, { onConflict: 'user_id' })
        .select()
        .single();
    
    if (error) {
        console.error("Error updating wishlist:", error);
        throw error;
    }

    return { userId: data.user_id, items: data.items };
};

export const getUserDashboardStats = async (userId: string): Promise<DashboardStats> => {
    const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    if (ordersError) {
        console.error("Error getting order count:", ordersError);
        throw ordersError;
    }
    
    const { data: ordersData, error: ordersDataError } = await supabase
        .from('orders')
        .select('pricing')
        .eq('user_id', userId);

    if (ordersDataError) {
        console.error("Error getting orders for total spent:", ordersDataError);
        throw ordersDataError;
    }

    const totalSpent = ordersData?.reduce((sum, order) => sum + (order.pricing?.total || 0), 0) || 0;

    const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('items')
        .eq('user_id', userId)
        .single();
        
    if (wishlistError && wishlistError.code !== 'PGRST116') {
        console.error("Error fetching wishlist for stats:", wishlistError);
        throw wishlistError;
    }

    const wishlistCount = wishlistData?.items?.length || 0;

    return {
        totalOrders: totalOrders || 0,
        totalSpent,
        wishlistCount,
    };
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
    
    return data.map((o: any) => ({
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        status: o.status,
        items: o.items,
        pricing: o.pricing,
        shippingAddress: o.shipping_address,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        statusHistory: o.status_history,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        estimatedDelivery: o.estimated_delivery,
    }));
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
    
    if (error) {
        if (error.code === 'PGRST116') return undefined; // Not found
        console.error("Error fetching order by ID:", error);
        throw error;
    }
    if (!data) return undefined;

    const o = data;
    return {
        id: o.id,
        orderNumber: o.order_number,
        userId: o.user_id,
        status: o.status,
        items: o.items,
        pricing: o.pricing,
        shippingAddress: o.shipping_address,
        paymentMethod: o.payment_method,
        paymentStatus: o.payment_status,
        statusHistory: o.status_history,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
        estimatedDelivery: o.estimated_delivery,
    };
};

export const placeOrder = (userId: string, items: CartItem[], shippingAddress: Address): Promise<{ orderId: string }> => {
    return new Promise(resolve => setTimeout(() => resolve({ orderId: `mock-order-${Date.now()}` }), API_DELAY));
};
