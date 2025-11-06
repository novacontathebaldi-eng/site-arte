import { mockProducts, mockOrders } from '../lib/mockData';
import { Product, Order } from '../types';

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
