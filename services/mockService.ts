

import { Painting as Product, Category } from '../types';

let mockStoreStatus = { isOnline: true };

const mockCategories: Category[] = [
    { id: 'pizzas-salgadas', name: 'Pizzas Salgadas', order: 1, active: true },
    { id: 'pizzas-doces', name: 'Pizzas Doces', order: 2, active: true },
    { id: 'bebidas', name: 'Bebidas', order: 3, active: true },
    { id: 'sobremesas', name: 'Sobremesas', order: 4, active: true },
    { id: 'aperitivos', name: 'Aperitivos', order: 5, active: true }
];

let mockProducts: Product[] = [
    // FIX: Replaced 'prices' object with a single 'price' number and removed 'size' to match the 'Painting' type.
    { id: 'margherita', name: 'Pizza Margherita', description: 'Molho de tomate, mozzarella de búfala, manjericão fresco e azeite extravirgem', categoryId: 'pizzas-salgadas', price: 48.00, imageUrl: 'https://picsum.photos/seed/margherita/400/300', badge: 'Popular', active: true, orderIndex: 0, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'calabresa', name: 'Calabresa Especial', description: 'Molho de tomate, calabresa artesanal, cebola roxa, azeitonas pretas e orégano', categoryId: 'pizzas-salgadas', price: 52.00, imageUrl: 'https://picsum.photos/seed/calabresa/400/300', active: true, orderIndex: 1, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'portuguesa', name: 'Portuguesa Premium', description: 'Presunto parma, ovos caipira, ervilhas fresquinhas e azeitonas portuguesas', categoryId: 'pizzas-salgadas', price: 58.00, imageUrl: 'https://picsum.photos/seed/portuguesa/400/300', badge: 'Premium', active: true, orderIndex: 2, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'quatro-queijos', name: '4 Queijos Gourmet', description: 'Mozzarella, gorgonzola DOP, parmesão reggiano e catupiry premium', categoryId: 'pizzas-salgadas', price: 62.00, imageUrl: 'https://picsum.photos/seed/queijos/400/300', badge: 'Gourmet', active: true, orderIndex: 3, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'frango-catupiry', name: 'Frango com Catupiry', description: 'Frango desfiado temperado, catupiry premium, milho e azeitonas', categoryId: 'pizzas-salgadas', price: 57.00, imageUrl: 'https://picsum.photos/seed/frango/400/300', active: true, orderIndex: 4, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'chocolate-morango', name: 'Chocolate com Morango', description: 'Massa doce, nutella, morangos frescos, banana e açúcar de confeiteiro', categoryId: 'pizzas-doces', price: 42.00, imageUrl: 'https://picsum.photos/seed/chocomorango/400/300', badge: 'Popular', active: true, orderIndex: 5, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'banana-canela', name: 'Banana com Canela', description: 'Massa doce, banana, canela em pó, açúcar cristal e leite condensado', categoryId: 'pizzas-doces', price: 38.00, imageUrl: 'https://picsum.photos/seed/banana/400/300', active: true, orderIndex: 6, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'coca-2l', name: 'Coca-Cola 2L', description: 'Refrigerante Coca-Cola 2 litros gelado', categoryId: 'bebidas', price: 8.00, imageUrl: 'https://picsum.photos/seed/coca/400/300', active: true, orderIndex: 7, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'guarana-2l', name: 'Guaraná Antarctica 2L', description: 'Refrigerante Guaraná Antarctica 2 litros gelado', categoryId: 'bebidas', price: 8.00, imageUrl: 'https://picsum.photos/seed/guarana/400/300', active: true, orderIndex: 8, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'pudim', name: 'Pudim de Leite Condensado', description: 'Pudim cremoso feito com leite condensado e calda de açúcar', categoryId: 'sobremesas', price: 12.00, imageUrl: 'https://picsum.photos/seed/pudim/400/300', active: true, orderIndex: 9, dimensions: 'M', technique: 'Oil', year: 2023 },
    { id: 'batata-frita', name: 'Batata Frita Especial', description: 'Batata frita crocante temperada com ervas', categoryId: 'aperitivos', price: 18.00, imageUrl: 'https://picsum.photos/seed/batata/400/300', active: true, orderIndex: 10, dimensions: 'M', technique: 'Oil', year: 2023 },
];

const simulateDelay = <T,>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), 200));

export const getMockData = () => simulateDelay({
    products: [...mockProducts],
    categories: [...mockCategories],
    isOnline: mockStoreStatus.isOnline
});

export const updateMockProduct = (product: Product): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === product.id);
    if (index !== -1) {
        mockProducts[index] = product;
        return simulateDelay(product);
    }
    return Promise.reject(new Error("Product not found"));
};

export const addMockProduct = (productData: Omit<Product, 'id'>): Promise<Product> => {
    const newProduct: Product = {
        ...productData,
        id: `prod_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    mockProducts.push(newProduct);
    return simulateDelay(newProduct);
};

export const deleteMockProduct = (productId: string): Promise<{ success: boolean }> => {
    const initialLength = mockProducts.length;
    mockProducts = mockProducts.filter(p => p.id !== productId);
    if (mockProducts.length < initialLength) {
        return simulateDelay({ success: true });
    }
    return Promise.reject(new Error("Product not found"));
};

export const updateMockStoreStatus = (isOnline: boolean): Promise<boolean> => {
    mockStoreStatus.isOnline = isOnline;
    return simulateDelay(true);
};
