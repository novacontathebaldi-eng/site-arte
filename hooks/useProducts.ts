import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';

export interface ProductFilters {
  searchTerm?: string;
}

const PAGE_SIZE = 8;

export const useProducts = (filters: ProductFilters) => {
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (isInitialLoad = false) => {
    if ((!isInitialLoad && loadingMore) || !hasMore) return;

    if (isInitialLoad) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let q: Query<DocumentData> = collection(db, 'products');

      q = query(q, where('publishedAt', '!=', null));
      
      if (filters.searchTerm) {
        q = query(q, where('keywords', 'array-contains', filters.searchTerm.toLowerCase()));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (!isInitialLoad && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(PAGE_SIZE));
      
      const querySnapshot = await getDocs(q);
      const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

      setProducts(prev => isInitialLoad ? newProducts : [...prev, ...newProducts]);
      
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setLastDoc(newLastDoc);
      
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [filters.searchTerm, hasMore, lastDoc, loadingMore]);

  useEffect(() => {
    if (filters.searchTerm) { // Only auto-fetch for search
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
        fetchProducts(true);
    }
  }, [filters.searchTerm, fetchProducts]);

  // Initial fetch for non-search usage
  useEffect(() => {
    if (!filters.searchTerm) {
      fetchProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const loadMore = useCallback(() => {
    fetchProducts(false);
  }, [fetchProducts]);

  return { products, loading, loadingMore, error, hasMore, loadMore };
};
