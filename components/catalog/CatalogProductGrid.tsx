import React, { useRef, useEffect, useCallback } from 'react';
import { useProducts, ProductFilters } from '../../hooks/useProducts';
import CatalogProductCard from './CatalogProductCard';
import Skeleton from '../common/Skeleton';
import Spinner from '../common/Spinner';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';

interface CatalogProductGridProps {
  filters: ProductFilters;
}

const CatalogProductGrid: React.FC<CatalogProductGridProps> = ({ filters }) => {
    const { products, loading, loadingMore, error, hasMore, loadMore } = useProducts(filters);
    const observer = useRef<IntersectionObserver>();
    const { t } = useI18n();

    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore, loadMore]);

    const renderGridContent = () => {
        if (loading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]"/>)}
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
        
        if (products.length === 0) {
             return (
                <div className="text-center py-20">
                    <h3 className="text-2xl font-serif font-bold">{t('catalog.noResults.title')}</h3>
                    <p className="mt-2 text-brand-black/70">{t('catalog.noResults.subtitle')}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                {products.map((product, index) => {
                    if (products.length === index + 1) {
                        return <div ref={lastProductElementRef} key={product.id}><CatalogProductCard product={product} /></div>;
                    }
                    return <CatalogProductCard key={product.id} product={product} />;
                })}
            </div>
        );
    };

    return (
        <div>
            {renderGridContent()}
            <div className="py-12 text-center">
                {loadingMore && <Spinner />}
                {!loading && !hasMore && products.length > 0 && (
                    <p className="text-brand-black/60">{t('catalog.endOfResults')}</p>
                )}
            </div>
        </div>
    );
};

export default CatalogProductGrid;