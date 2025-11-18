import { create } from 'zustand';
import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product } from '@/types';

interface ProductsState {
  products: Product[];
  featuredProducts: Product[];
  isLoading: boolean;
  hasMore: boolean;
  lastDoc: any;
  loadProducts: (filters?: any, reset?: boolean) => Promise<void>;
  loadFeaturedProducts: () => Promise<void>;
  loadProduct: (id: string) => Promise<Product | null>;
  searchProducts: (query: string) => Promise<Product[]>;
  getProductsByCategory: (category: string) => Promise<Product[]>;
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  featuredProducts: [],
  isLoading: false,
  hasMore: true,
  lastDoc: null,

  loadProducts: async (filters = {}, reset = false) => {
    set({ isLoading: true });
    
    try {
      let q = query(
        collection(db, 'products'),
        where('publishedAt', '!=', null),
        orderBy('publishedAt', 'desc'),
        limit(12)
      );

      // Apply filters
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.minPrice || filters.maxPrice) {
        // Price filtering would need to be done client-side
        // as Firestore doesn't support range queries on multiple fields
      }

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });

      // Apply price filters client-side if needed
      let filteredProducts = products;
      if (filters.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price.amount >= filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price.amount <= filters.maxPrice);
      }

      set({
        products: reset ? filteredProducts : [...get().products, ...filteredProducts],
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
        hasMore: querySnapshot.docs.length === 12,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading products:', error);
      set({ isLoading: false });
    }
  },

  loadFeaturedProducts: async () => {
    set({ isLoading: true });
    
    try {
      const q = query(
        collection(db, 'products'),
        where('featured', '==', true),
        where('publishedAt', '!=', null),
        orderBy('publishedAt', 'desc'),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });

      set({
        featuredProducts: products,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading featured products:', error);
      set({ isLoading: false });
    }
  },

  loadProduct: async (id: string) => {
    try {
      // This would typically fetch a single product
      // For now, return null as we'll implement this later
      return null;
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  },

  searchProducts: async (searchQuery: string) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('publishedAt', '!=', null),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });

      // Filter by search query
      const searchLower = searchQuery.toLowerCase();
      return products.filter(product => 
        product.translations.fr.title.toLowerCase().includes(searchLower) ||
        product.translations.en.title.toLowerCase().includes(searchLower) ||
        product.translations.de.title.toLowerCase().includes(searchLower) ||
        product.translations.pt.title.toLowerCase().includes(searchLower) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  getProductsByCategory: async (category: string) => {
    try {
      const q = query(
        collection(db, 'products'),
        where('category', '==', category),
        where('publishedAt', '!=', null),
        orderBy('publishedAt', 'desc'),
        limit(20)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        } as Product);
      });

      return products;
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }
}));