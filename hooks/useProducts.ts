import { useQuery } from '@tanstack/react-query';
import { getCollection } from '../lib/firebase/firestore';
import { Product, ProductCategory } from '../types/product';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const data = await getCollection('products');
      
      // Map and validate data
      const products = data.map((doc: any) => ({
        id: doc.id,
        translations: doc.translations || {},
        price: doc.price || 0,
        category: doc.category || ProductCategory.PAINTINGS,
        images: doc.images || [],
        available: doc.available ?? true,
        status: doc.status || (doc.available ? 'available' : 'sold'),
        stock: doc.stock || 1,
        dimensions: doc.dimensions || '',
        featured: doc.featured || false,
        createdAt: doc.createdAt
      })) as Product[];

      return products;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
