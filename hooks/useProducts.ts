import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../services/productService';
import { ProductFilters } from '../types';

export const useProducts = (filters: ProductFilters) => {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => fetchProducts(filters),
        staleTime: 1000 * 60 * 5, // 5 minutos
        gcTime: 1000 * 60 * 10, // garbage collect após 10 min
    });
};
