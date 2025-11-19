import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../hooks/useRouter';
import CategoryTabs from './catalog/CategoryTabs';
import FilterSidebar from './catalog/FilterSidebar';
import CatalogProductGrid from './catalog/CatalogProductGrid';
import { ProductFilters } from '../hooks/useProducts';

const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

const CatalogPage: React.FC = () => {
    const { queryParams, navigate } = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filters = useMemo((): ProductFilters => {
        const statusParam = queryParams.get('status');
        return {
            category: queryParams.get('category') || 'all',
            minPrice: Number(queryParams.get('minPrice')) || 0,
            maxPrice: Number(queryParams.get('maxPrice')) || 0,
            status: statusParam ? statusParam.split(',') : [],
        };
    }, [queryParams]);

    const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
        const newParams = new URLSearchParams(queryParams.toString());
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === null || (typeof value === 'string' && !value) || (Array.isArray(value) && value.length === 0) || (typeof value === 'number' && value === 0)) {
                newParams.delete(key);
            } else {
                newParams.set(key, Array.isArray(value) ? value.join(',') : String(value));
            }
        });

        // Reset category if it's 'all'
        if (newFilters.category === 'all') {
            newParams.delete('category');
        }

        const newSearch = newParams.toString();
        navigate(`/catalog${newSearch ? `?${newSearch}` : ''}`);
    };
    
    const handleCategoryChange = (category: string) => {
        handleFilterChange({ category });
    };

    return (
        <div className="bg-brand-white">
            <header className="sticky top-20 z-30 bg-brand-white/80 backdrop-blur-lg border-b border-black/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <CategoryTabs 
                        selectedCategory={filters.category || 'all'}
                        onSelectCategory={handleCategoryChange}
                    />
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                        className="p-2 lg:hidden flex items-center gap-2 text-sm font-semibold"
                    >
                        <FilterIcon className="w-5 h-5"/>
                        <span>Filters</span>
                    </button>
                </div>
            </header>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar 
                        currentFilters={filters} 
                        onFilterChange={handleFilterChange}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                    <main className="flex-1">
                        <CatalogProductGrid filters={filters} />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;