import React, { useMemo } from 'react';
import { useRouter } from '../hooks/useRouter';
import CategoryTabs from './catalog/CategoryTabs';
import CatalogProductGrid from './catalog/CatalogProductGrid';
import { ProductFilters } from '../hooks/useProducts';

const CatalogPage: React.FC = () => {
    const { queryParams, navigate } = useRouter();

    const filters = useMemo((): ProductFilters => {
        return {
            category: queryParams.get('category') || undefined,
        };
    }, [queryParams]);

    const handleCategoryChange = (category?: string) => {
        const newParams = new URLSearchParams(queryParams.toString());
        if (category) {
            newParams.set('category', category);
        } else {
            newParams.delete('category');
        }
        const newSearch = newParams.toString();
        navigate(`/catalog${newSearch ? `?${newSearch}` : ''}`);
    };

    return (
        <div className="bg-brand-white">
            <header className="sticky top-20 z-30 bg-brand-white/80 backdrop-blur-lg border-b border-black/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <CategoryTabs 
                        selectedCategory={filters.category}
                        onSelectCategory={handleCategoryChange}
                    />
                </div>
            </header>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <main className="flex-1">
                    <CatalogProductGrid filters={filters} />
                </main>
            </div>
        </div>
    );
};

export default CatalogPage;