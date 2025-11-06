import { mockProducts, mockOrders, mockAddresses, mockWishlist } from '../lib/mockData';
import { Product, Order, Address, AddressWithId, Wishlist, DashboardStats } from '../types';

// Este arquivo simula a comunicação com o seu backend (as Vercel Functions e o Firebase).
// Em um projeto real, aqui você faria chamadas de rede (usando `fetch` ou `axios`)
// para buscar os dados do banco de dados. Para o nosso protótipo, ele apenas
// busca os dados do nosso arquivo de mock `mockData.ts`.

const API_DELAY = 500; // Atraso de 500ms para simular o tempo de resposta da rede.

/**
 * Busca todos os produtos.
 * @returns Uma Promise que resolve com a lista de todos os produtos.
 */
export const getProducts = (): Promise<Product[]> => {
  console.log('Fetching all products...');
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Fetched all products.');
      resolve(mockProducts);
    }, API_DELAY);
  });
};

/**
 * Busca um único produto pelo seu 'slug' (o nome na URL).
 * @param slug O identificador do produto na URL.
 * @returns Uma Promise que resolve com o produto encontrado ou undefined se não encontrar.
 */
export const getProductBySlug = (slug: string): Promise<Product | undefined> => {
  console.log(`Fetching product with slug: ${slug}`);
  return new Promise(resolve => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.slug === slug);
      console.log(`Fetched product:`, product);
      resolve(product);
    }, API_DELAY);
  });
};

/**
 * Busca produtos que estão marcados como 'featured' (em destaque).
 * @returns Uma Promise que resolve com uma lista de produtos em destaque.
 */
export const getFeaturedProducts = (): Promise<Product[]> => {
    console.log('Fetching featured products...');
    return new Promise(resolve => {
        setTimeout(() => {
            const featured = mockProducts.filter(p => p.featured);
            console.log('Fetched featured products.');
            resolve(featured);
        }, API_DELAY);
    });
};

/**
 * Busca todos os pedidos de um usuário específico.
 * @param userId O ID do usuário.
 * @returns Uma Promise que resolve com a lista de pedidos do usuário.
 */
export const getOrdersByUserId = (userId: string): Promise<Order[]> => {
    console.log(`Fetching orders for user: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            // Em um app real, o `userId` seria usado para filtrar.
            // Como temos apenas um usuário mock, retornamos todos os pedidos mock.
            resolve(mockOrders);
        }, API_DELAY);
    });
};


/**
 * Busca um único pedido pelo seu ID.
 * @param orderId O ID do pedido.
 * @returns Uma Promise que resolve com o pedido encontrado ou undefined.
 */
export const getOrderById = (orderId: string): Promise<Order | undefined> => {
    console.log(`Fetching order with id: ${orderId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);
            resolve(order);
        }, API_DELAY);
    });
};

// --- Funções da API para Endereços ---

export const getAddresses = (userId: string): Promise<AddressWithId[]> => {
  console.log(`Fetching addresses for user: ${userId}`);
  return new Promise(resolve => setTimeout(() => resolve([...mockAddresses]), API_DELAY));
};

export const addAddress = (userId: string, address: Address): Promise<AddressWithId> => {
  console.log(`Adding address for user: ${userId}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (address.isDefault) {
        mockAddresses.forEach(a => a.isDefault = false);
      }
      const newAddress: AddressWithId = { ...address, id: `addr-${Date.now()}` };
      mockAddresses.push(newAddress);
      resolve(newAddress);
    }, API_DELAY);
  });
};

export const updateAddress = (userId: string, addressId: string, address: Address): Promise<AddressWithId> => {
  console.log(`Updating address ${addressId} for user: ${userId}`);
  return new Promise(resolve => {
    setTimeout(() => {
       if (address.isDefault) {
        mockAddresses.forEach(a => a.isDefault = false);
      }
      const index = mockAddresses.findIndex(a => a.id === addressId);
      mockAddresses[index] = { ...address, id: addressId };
      resolve(mockAddresses[index]);
    }, API_DELAY);
  });
};

export const deleteAddress = (userId: string, addressId: string): Promise<void> => {
    console.log(`Deleting address ${addressId} for user: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const index = mockAddresses.findIndex(a => a.id === addressId);
            if (index > -1) {
                mockAddresses.splice(index, 1);
            }
            resolve();
        }, API_DELAY);
    });
};

// --- Funções da API para Wishlist ---

export const getWishlist = (userId: string): Promise<Wishlist> => {
    console.log(`Fetching wishlist for user: ${userId}`);
    return new Promise(resolve => setTimeout(() => resolve({ ...mockWishlist }), API_DELAY));
};

export const updateWishlist = (userId: string, wishlist: Wishlist): Promise<Wishlist> => {
    console.log(`Updating wishlist for user: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            // FIX: Cannot assign to 'mockWishlist' because it is an import.
            // Mutate the object instead of reassigning it.
            mockWishlist.items = wishlist.items;
            mockWishlist.userId = wishlist.userId;
            resolve({ ...mockWishlist });
        }, API_DELAY);
    });
}

// --- Funções da API para Dashboard ---
export const getUserDashboardStats = (userId: string): Promise<DashboardStats> => {
    console.log(`Fetching stats for user: ${userId}`);
    return new Promise(resolve => {
        setTimeout(() => {
            const totalSpent = mockOrders.reduce((sum, order) => sum + order.pricing.total, 0);
            const stats: DashboardStats = {
                totalOrders: mockOrders.length,
                totalSpent: totalSpent,
                wishlistCount: mockWishlist.items.length
            };
            resolve(stats);
        }, API_DELAY);
    });
}