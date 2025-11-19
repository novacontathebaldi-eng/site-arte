
import React, { useEffect, useState } from 'react';
import { useProducts, Filters } from '../hooks/useProducts';
import { useRouter } from '../hooks/useRouter';
import ProductGrid from './ProductGrid';
import FilterSidebar from './catalog/FilterSidebar';
import Spinner from './common/Spinner';
import InfiniteScrollTrigger from './catalog/InfiniteScrollTrigger';

const CatalogPage: React.FC = () => {
    const { queryParams } = useRouter();
    
    // Initialize filters from URL query parameters only on first render
    const [initialFilters] = useState<Filters>(() => {
      const category = queryParams.get('category');
      return {
        categories: category ? category.split(',') : [],
      };
    });
    
    const { products, loading, hasMore, loadMore, applyFilters } = useProducts(initialFilters);

    const handleFilterChange = (newFilters: Filters) => {
        // Here you could also update URL params for shareable links
        applyFilters(newFilters);
    };

    return (
        <div className="bg-brand-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                     <h1 className="text-4xl font-serif font-bold text-brand-black">Our Collection</h1>
                     <p className="mt-2 text-lg text-brand-black/70 max-w-2xl mx-auto">Explore a curated selection of original paintings, handcrafted jewelry, and unique art prints.</p>
                </div>
                <div className="lg:grid lg:grid-cols-4 lg:gap-x-8">
                    <aside className="lg:col-span-1">
                      <FilterSidebar onFilterChange={handleFilterChange} initialFilters={initialFilters} />
                    </aside>
                    
                    <div className="lg:col-span-3 mt-8 lg:mt-0">
                        <ProductGrid products={products} loading={loading && products.length === 0} gridClass="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8" />
                        
                        <div className="h-20 flex justify-center items-center">
                            {loading && <Spinner />}
                            {!hasMore && products.length > 0 && (
                                <p className="text-brand-black/60">You've reached the end of the collection.</p>
                            )}
                        </div>
                        
                        {hasMore && !loading && (
                           <InfiniteScrollTrigger onIntersect={loadMore} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CatalogPage;
