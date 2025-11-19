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

            // NOTE: Firestore requires creating composite indexes for most of these compound queries.
            // If you see errors in the console, follow the link it provides to create the index in the Firebase Console.

            if (currentFilters.categories && currentFilters.categories.length > 0) {
                constraints.push(where('category', 'in', currentFilters.categories));
            }
            if (currentFilters.status) {
                constraints.push(where('status', '==', currentFilters.status));
            }
            
            // FIXME: Temporarily disabled due to Firestore query limitations requiring specific composite indexes.
            // A production solution would involve creating these indexes in Firebase Console or using a dedicated search service.
            /*
            if (currentFilters.priceRange && currentFilters.priceRange.max > currentFilters.priceRange.min) {
                constraints.push(where('price.amount', '>=', currentFilters.priceRange.min * 100));
                constraints.push(where('price.amount', '<=', currentFilters.priceRange.max * 100));
            }
            
            // Basic search on tags array. For better search, a dedicated service like Algolia is recommended.
            if(currentFilters.search && currentFilters.search.trim() !== '') {
                constraints.push(where('tags', 'array-contains', currentFilters.search.toLowerCase().trim()));
            }
            */
            
            constraints.push(orderBy('createdAt', 'desc'));
            constraints.push(limit(PRODUCTS_PER_PAGE));
            
            if (lastVisibleDoc) {
                constraints.push(startAfter(lastVisibleDoc));
            }
            
            const q = query(productsRef, ...constraints);

            const querySnapshot = await getDocs(q);
            const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

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
        fetchProducts(filters, null);
    }, [filters, fetchProducts]);

    const loadMore = () => {
        if (hasMore && !loading) {
            fetchProducts(filters, lastDoc);
        }
    };

    const applyFilters = (newFilters: Filters) => {
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
        setFilters(newFilters);
    };

    return { products, loading, hasMore, loadMore, filters, applyFilters };
};
