import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import CategoryTabs from './catalog/CategoryTabs';
import CatalogProductCard from './catalog/CatalogProductCard';
import { ProductDocument } from '../firebase-types';
import { CATEGORIES } from '../constants';
import { useI18n } from '../hooks/useI18n';
import Skeleton from './common/Skeleton';
import Spinner from './common/Spinner';
import Button from './common/Button';

const CatalogPage: React.FC = () => {
    const { t } = useI18n();
    const { products, loading, loadingMore, error, hasMore, loadMore } = useProducts({});
    
    const [activeCategoryId, setActiveCategoryId] = useState<string>('');
    const [productsByCategory, setProductsByCategory] = useState<Record<string, ProductDocument[]>>({});
    
    const categoryRefs = useRef<Map<string, HTMLElement | null>>(new Map());
    const isClickNavigating = useRef(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const grouped = products.reduce((acc, product) => {
            const categoryId = product.category;
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(product);
            return acc;
        }, {} as Record<string, ProductDocument[]>);
        setProductsByCategory(grouped);
    }, [products]);

    const sortedCategoriesWithProducts = useMemo(() => {
        return CATEGORIES.filter(cat => productsByCategory[cat.id] && productsByCategory[cat.id].length > 0);
    }, [productsByCategory]);
    
    useEffect(() => {
      if (!activeCategoryId && sortedCategoriesWithProducts.length > 0) {
        setActiveCategoryId(sortedCategoriesWithProducts[0].id);
      }
    }, [sortedCategoriesWithProducts, activeCategoryId]);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(
            (entries) => {
                if (isClickNavigating.current) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveCategoryId(entry.target.id.replace('category-section-', ''));
                    }
                });
            },
            { rootMargin: `-120px 0px -50% 0px`, threshold: 0 }
        );

        const currentRefs = categoryRefs.current;
        currentRefs.forEach((el) => {
            if (el) observer.current?.observe(el);
        });

        return () => {
            currentRefs.forEach((el) => {
                if (el) observer.current?.unobserve(el);
            });
        };
    }, [sortedCategoriesWithProducts]);

    const handleTabClick = (categoryId: string) => {
        isClickNavigating.current = true;
        setActiveCategoryId(categoryId);

        const element = document.getElementById(`category-section-${categoryId}`);
        const headerOffset = 100; // Sticky header + tabs
        if (element) {
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
        
        setTimeout(() => { isClickNavigating.current = false; }, 1000);
    };
    
    const infiniteScrollObserver = useRef<IntersectionObserver>();
    const lastElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (infiniteScrollObserver.current) infiniteScrollObserver.current.disconnect();
        
        infiniteScrollObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) infiniteScrollObserver.current.observe(node);
    }, [loading, loadingMore, hasMore, loadMore]);

    const renderContent = () => {
        if (loading && products.length === 0) {
            return (
                <div className="space-y-12">
                    {[...Array(2)].map((_, i) => (
                         <div key={i}>
                            <Skeleton className="h-8 w-1/3 mb-6" />
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {[...Array(4)].map((_, j) => <Skeleton key={j} className="aspect-[3/4]"/>)}
                             </div>
                         </div>
                    ))}
                </div>
            );
        }
        
        if (error) {
            return (
                 <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{t('catalog.fetchError')}</p>
                    <Button onClick={() => window.location.reload()}>{t('catalog.retry')}</Button>
                </div>
            );
        }
        
         if (!loading && products.length === 0) {
             return (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-serif font-bold">{t('catalog.noResults.title')}</h3>
                    <p className="mt-2 text-brand-black/70">{t('catalog.noResults.subtitle').replace('ajustar seus filtros ou de ','')}</p>
                </div>
            );
        }

        return (
            <div className="space-y-12">
                {sortedCategoriesWithProducts.map(category => (
                    <section
                        key={category.id}
                        id={`category-section-${category.id}`}
                        ref={(el) => categoryRefs.current.set(category.id, el)}
                        aria-labelledby={`category-title-${category.id}`}
                    >
                        <h3 id={`category-title-${category.id}`} className="text-3xl font-bold font-serif text-brand-black mb-6 border-l-4 border-brand-gold pl-4">
                            {t(category.nameKey)}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                            {(productsByCategory[category.id] || []).map(product => (
                                <CatalogProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        );
    }

    return (
        <div className="bg-brand-white">
            <header className="sticky top-20 z-30 bg-brand-white/95 backdrop-blur-sm border-b border-black/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <CategoryTabs 
                        categories={sortedCategoriesWithProducts}
                        activeCategoryId={activeCategoryId}
                        onTabClick={handleTabClick}
                    />
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {renderContent()}
            </main>
            <div ref={lastElementRef} className="h-10" />
            <div className="py-12 text-center">
                {loadingMore && <Spinner />}
                {!loading && !hasMore && products.length > 0 && (
                    <p className="text-brand-black/60">{t('catalog.endOfResults')}</p>
                )}
            </div>
        </div>
    );
};

export default CatalogPage;
