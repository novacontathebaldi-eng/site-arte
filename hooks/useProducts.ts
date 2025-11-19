import { useState, useEffect, useCallback, useRef } from 'react';
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
  category?: string;
  searchTerm?: string;
}

const PAGE_SIZE = 12;

export const useProducts = (filters: ProductFilters, isSearch = false) => {
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Use a ref to store filters to avoid re-running effect on every filter change during typing
  const filtersRef = useRef(filters);

  const fetchProducts = useCallback(async (isInitial = false) => {
    if ((!isInitial && loadingMore) || !hasMore) return;

    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let q: Query<DocumentData> = collection(db, 'products');

      // Always filter for published products unless it's a search
      if (!isSearch) {
        q = query(q, where('publishedAt', '!=', null));
      }
      
      const currentFilters = filtersRef.current;

      if (currentFilters.category) {
        q = query(q, where('category', '==', currentFilters.category));
      }
      
      if (currentFilters.searchTerm) {
          q = query(q, where('keywords', 'array-contains', currentFilters.searchTerm.toLowerCase()));
      }
      
      // Order by publishedAt first to allow inequality filters, then by creation date.
      // This combination generally works without requiring complex custom indexes.
      if (isSearch) {
        // No specific order for search results for now to keep it simple
      } else {
        q = query(q, orderBy('publishedAt', 'desc'), orderBy('createdAt', 'desc'));
      }


      if (!isInitial && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      q = query(q, limit(PAGE_SIZE));
      
      const querySnapshot = await getDocs(q);

      let newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

      setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
      
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setLastDoc(newLastDoc);
      
      setHasMore(querySnapshot.docs.length === PAGE_SIZE);

    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      if (isInitial) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [loadingMore, hasMore, lastDoc, isSearch]);

  useEffect(() => {
    filtersRef.current = filters;
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    // The timeout gives a moment for the UI to clear before the new loading state appears,
    // providing a smoother transition when filters change.
    const timer = setTimeout(() => fetchProducts(true), 50);
    return () => clearTimeout(timer);
  }, [filters, fetchProducts]);
  
  const loadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) {
        fetchProducts(false);
    }
  }, [hasMore, loading, loadingMore, fetchProducts]);

  return { products, loading, loadingMore, error, hasMore, loadMore };
};