
import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, DocumentData, QueryConstraint } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';

export interface Filters {
    search?: string;
    categories?: string[];
    priceRange?: { min: number; max: number };
    status?: string;
}

const PRODUCTS_PER_PAGE = 8;

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

            // Always filter for published products on the storefront
            constraints.push(where('publishedAt', '!=', null));

            if (currentFilters.categories && currentFilters.categories.length > 0) {
                constraints.push(where('category', 'in', currentFilters.categories));
            }
            
            // To avoid needing a composite index for status + publishedAt, we can filter status client-side if needed
            // For now, only 'available' is a common filter which we will assume is covered by publishedAt.
            // if (currentFilters.status) { ... }

            // Order by publish date instead of creation date for storefront relevance
            constraints.push(orderBy('publishedAt', 'desc'));
            
            if (lastVisibleDoc) {
                constraints.push(startAfter(lastVisibleDoc));
            }
            
            constraints.push(limit(PRODUCTS_PER_PAGE));
            
            const q = query(productsRef, ...constraints);

            const querySnapshot = await getDocs(q);
            const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

            // Client-side sort after fetch is no longer needed as we simplified the query
            setProducts(prev => lastVisibleDoc ? [...prev, ...newProducts] : newProducts);
            setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
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
