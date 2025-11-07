import { mockProducts, mockOrders, mockAddresses, mockWishlist } from '../lib/mockData';
import { Product, Order, Address, AddressWithId, Wishlist, DashboardStats, CartItem } from '../types';

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
  return new Promise(resolve => {
    setTimeout(() => {
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
  return new Promise(resolve => {
    setTimeout(() => {
      const product = mockProducts.find(p => p.slug === slug);
      resolve(product);
    }, API_DELAY);
  });
};

/**
 * Busca produtos que estão marcados como 'featured' (em destaque).
 * @returns Uma Promise que resolve com uma lista de produtos em destaque.
 */
export const getFeaturedProducts = (): Promise<Product[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const featured = mockProducts.filter(p => p.featured);
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
    return new Promise(resolve => {
        setTimeout(() => {
            // Para simular um novo usuário, retornamos um array vazio.
            resolve([]);
        }, API_DELAY);
    });
};


/**
 * Busca um único pedido pelo seu ID.
 * @param orderId O ID do pedido.
 * @returns Uma Promise que resolve com o pedido encontrado ou undefined.
 */
export const getOrderById = (orderId: string): Promise<Order | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Isso ainda pode retornar um pedido mock se o ID corresponder.
            // Para um novo usuário, ele não terá IDs de pedido para consultar.
            const order = mockOrders.find(o => o.id === orderId);
            resolve(order);
        }, API_DELAY);
    });
};

// --- Funções da API para Endereços ---

export const getAddresses = (userId: string): Promise<AddressWithId[]> => {
  return new Promise(resolve => setTimeout(() => resolve([]), API_DELAY));
};

export const addAddress = (userId: string, address: Address): Promise<AddressWithId> => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (address.isDefault) {
        mockAddresses.forEach(a => a.isDefault = false);
      }
      const newAddress: AddressWithId = { ...address, id: `addr-${Date.now()}` };
      // Em uma aplicação real, isso seria salvo no DB. Aqui, apenas retornamos.
      resolve(newAddress);
    }, API_DELAY);
  });
};

export const updateAddress = (userId: string, addressId: string, address: Address): Promise<AddressWithId> => {
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
    return new Promise(resolve => setTimeout(() => resolve({ userId, items: [] }), API_DELAY));
};

export const updateWishlist = (userId: string, wishlist: Wishlist): Promise<Wishlist> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Simula a atualização e retorna a nova wishlist.
            resolve({ ...wishlist });
        }, API_DELAY);
    });
}

// --- Funções da API para Dashboard ---
export const getUserDashboardStats = (userId: string): Promise<DashboardStats> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const stats: DashboardStats = {
                totalOrders: 0,
                totalSpent: 0,
                wishlistCount: 0
            };
            resolve(stats);
        }, API_DELAY);
    });
}

// --- Funções da API para Checkout ---
export const placeOrder = (userId: string, items: CartItem[], shippingAddress: Address): Promise<{ orderId: string }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const orderId = `mock-order-${Date.now()}`;
            resolve({ orderId });
        }, API_DELAY);
    });
};