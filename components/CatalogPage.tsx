import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit, startAfter, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import { useRouter } from '../hooks/useRouter';
import Spinner from './common/Spinner';
import CategoryTabs from './catalog/CategoryTabs';
import FilterSidebar from './catalog/FilterSidebar';
import CatalogProductGrid from './catalog/CatalogProductGrid';
import SearchModal from './catalog/SearchModal';
import Button from './common/Button';

export interface CatalogFilters {
  price: { min: number; max: number };
  status: string[];
  search: string;
}

const CATEGORIES = ['all', 'paintings', 'jewelry', 'digital', 'prints'];
const PRODUCTS_PER_PAGE = 12;

const CatalogPage: React.FC = () => {
    const { path, navigate } = useRouter();
    const { t } = useI18n();

    const activeCategory = useMemo(() => {
        const categoryFromHash = window.location.hash.substring(2); // Remove #/
        return CATEGORIES.includes(categoryFromHash) ? categoryFromHash : 'all';
    }, [path]);

    const [products, setProducts] = useState<ProductDocument[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const [filters, setFilters] = useState<CatalogFilters>({
        price: { min: 0, max: 10000 },
        status: [],
        search: '',
    });

    const [isSearchModalOpen, setSearchModalOpen] = useState(false);
    const loaderRef = useRef<HTMLDivElement | null>(null);

    const fetchProducts = useCallback(async (lastVisibleDoc: DocumentData | null = null) => {
        if (!hasMore && lastVisibleDoc) return;
        setLoading(true);
        setError(null);
        try {
            const productsRef = collection(db, 'products');
            const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(PRODUCTS_PER_PAGE)];

            if (activeCategory !== 'all') {
                constraints.unshift(where('category', '==', activeCategory));
            }
            constraints.unshift(where('publishedAt', '!=', null));

            if (lastVisibleDoc) {
                constraints.push(startAfter(lastVisibleDoc));
            }

            const q = query(productsRef, ...constraints);
            const querySnapshot = await getDocs(q);
            const newProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));

            setProducts(prev => lastVisibleDoc ? [...prev, ...newProducts] : newProducts);
            setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
            setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(t('catalog.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [activeCategory, hasMore, t]);

    // Effect for category change
    useEffect(() => {
        setProducts([]);
        setLastDoc(null);
        setHasMore(true);
        fetchProducts(null);
    }, [activeCategory]); // Don't add fetchProducts here

    // Effect for client-side filtering
    useEffect(() => {
        const lowerCaseSearch = filters.search.toLowerCase();
        const filtered = products.filter(p => {
            const priceInEuros = p.price.amount / 100;
            const priceMatch = priceInEuros >= filters.price.min && priceInEuros <= filters.price.max;
            const statusMatch = filters.status.length === 0 || filters.status.includes(p.status);
            
            const searchMatch = lowerCaseSearch === '' ||
                (p.translations.en?.title.toLowerCase().includes(lowerCaseSearch)) ||
                (p.translations.en?.description.toLowerCase().includes(lowerCaseSearch)) ||
                (p.tags?.some(tag => tag.toLowerCase().includes(lowerCaseSearch)));

            return priceMatch && statusMatch && searchMatch;
        });
        setFilteredProducts(filtered);
    }, [products, filters]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchProducts(lastDoc);
                }
            },
            { threshold: 1.0 }
        );
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }
        return () => observer.disconnect();
    }, [hasMore, loading, lastDoc, fetchProducts]);

    const handleCategoryChange = (category: string) => {
        navigate(`/catalog#/${category}`);
    };

    return (
        <div className="bg-brand-white min-h-screen">
             <SearchModal 
                isOpen={isSearchModalOpen} 
                onClose={() => setSearchModalOpen(false)}
                onSearch={(searchTerm) => setFilters(f => ({...f, search: searchTerm}))}
            />
            <CategoryTabs 
                activeCategory={activeCategory} 
                onCategoryChange={handleCategoryChange}
                onSearchClick={() => setSearchModalOpen(true)}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
                    <aside className="lg:col-span-1">
                        <FilterSidebar onFilterChange={setFilters} initialFilters={filters} />
                    </aside>
                    <div className="lg:col-span-3 mt-8 lg:mt-0">
                        {loading && products.length === 0 ? (
                             <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
                                {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]"/>)}
                             </div>
                        ) : error ? (
                             <div className="text-center py-20">
                                 <p className="text-red-600">{error}</p>
                                 <Button onClick={() => fetchProducts(lastDoc)} className="mt-4">{t('catalog.retry')}</Button>
                             </div>
                        ) : filteredProducts.length === 0 ? (
                             <div className="text-center py-20 text-brand-black/70 col-span-full">
                                <h3 className="text-xl font-serif font-semibold">{t('catalog.noResults.title')}</h3>
                                <p className="mt-2">{t('catalog.noResults.subtitle')}</p>
                            </div>
                        ) : (
                            <CatalogProductGrid products={filteredProducts} />
                        )}
                        
                        <div ref={loaderRef} className="h-20 flex justify-center items-center">
                            {loading && products.length > 0 && <Spinner />}
                            {!hasMore && products.length > 0 && <p className="text-brand-black/60">{t('catalog.endOfResults')}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;
