

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentData, QueryConstraint, endAt, startAt } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';

export interface Filters {
    search?: string;
    categories?: string[];
    priceRange?: { min: number; max: number };
    status?: string;
}

const PRODUCTS_PER_PAGE = 12; // Increased for better infinite scroll experience with client-side filtering

export const useProducts = (initialFilters: Filters = {}) => {
    const [products, setProducts] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
    const [filters, setFilters] = useState<Filters>(initialFilters);

    const fetchProducts = useCallback(async (currentFilters: Filters, lastVisibleDoc: DocumentData | null = null) => {
        setLoading(true);
        try {
            const productsRef = collection(db, 'products');
            const constraints: QueryConstraint[] = [];

            // FIX: Removed the initial 'publishedAt' filter to avoid composite index errors.
            // It will be applied on the client-side.

            if (currentFilters.categories && currentFilters.categories.length > 0) {
                constraints.push(where('category', 'in', currentFilters.categories));
            } else {
                 constraints.push(orderBy('createdAt', 'desc'));
            }
            
            if (currentFilters.status) {
                constraints.push(where('status', '==', currentFilters.status));
            }
            
            constraints.push(limit(PRODUCTS_PER_PAGE));
            
            if (lastVisibleDoc) {
                constraints.push(startAfter(lastVisibleDoc));
            }
            
            const q = query(productsRef, ...constraints);

            const querySnapshot = await getDocs(q);
            const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

            // Client-side filter for published products
            const publishedProducts = newProducts.filter(p => p.publishedAt);

            setProducts(prev => lastVisibleDoc ? [...prev, ...publishedProducts] : publishedProducts);
            setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Reset and fetch when filters change
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
        fetchProducts(filters, null);
    }, [filters, fetchProducts]);

    const loadMore = () => {
        if (hasMore && !loading) {
            fetchProducts(filters, lastDoc);
        }
    };

    const applyFilters = (newFilters: Filters) => {
        setFilters(newFilters);
    };

    return { products, loading, hasMore, loadMore, filters, applyFilters };
};