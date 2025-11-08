import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ProductFilters } from '../types';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';

import FilterSidebar from '../components/FilterSidebar';
import CatalogProductCard from '../components/CatalogProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import Container from '../components/ui/Container';
import Pagination from '../components/ui/Pagination';
import { SearchIcon, XIcon } from '../components/ui/icons';

const CatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const parseQueryFilters = (): ProductFilters => {
    const params = new URLSearchParams(location.search);
    return {
      category: params.get('category')?.split(',').filter(Boolean) || [],
      minPrice: params.has('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      technique: params.get('technique')?.split(',').filter(Boolean) || [],
      sortBy: (params.get('sortBy') as ProductFilters['sortBy']) || 'newest',
      page: Number(params.get('page') || '1'),
      search: params.get('search') || '',
      limit: 12,
    };
  };

  const [filters, setFilters] = useState<ProductFilters>(parseQueryFilters);
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [debouncedSearch]);


  const { data, isLoading, error } = useProducts(filters);
  
  const updateUrl = (newFilters: ProductFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(key, value.join(','));
        } else {
          params.set(key, String(value));
        }
      }
    });
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };
  
  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateUrl(newFilters);
  };
  
  const handleClearFilters = () => {
    const clearedFilters: ProductFilters = { page: 1, limit: 12 };
    setFilters(clearedFilters);
    setSearch('');
    updateUrl(clearedFilters);
  };
  
  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 0;
  
  const startItem = total > 0 ? (filters.page! - 1) * filters.limit! + 1 : 0;
  const endItem = Math.min(startItem + filters.limit! - 1, total);

  return (
    <div className="bg-surface">
      <Container className="py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-12">
          {t('catalog.title')}
        </h1>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
            resultsCount={total}
          />

          {/* Main Content */}
          <main className="flex-1">
            {/* Search & Sort Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
              <div className="relative w-full md:w-auto md:flex-grow">
                <input
                  type="search"
                  placeholder={t('catalog.searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md"
                />
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                 {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <XIcon className="w-5 h-5 text-gray-400"/>
                    </button>
                 )}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-text-secondary whitespace-nowrap">{t('catalog.sortBy')}:</label>
                <select
                  id="sort-by"
                  value={filters.sortBy || 'newest'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:ring-secondary focus:border-secondary"
                >
                  <option value="newest">{t('catalog.newest')}</option>
                  <option value="price_asc">{t('catalog.priceLow')}</option>
                  <option value="price_desc">{t('catalog.priceHigh')}</option>
                  <option value="rating">{t('catalog.rating')}</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={12} />
            ) : error ? (
              <div className="text-center py-20 text-red-500">Error fetching products.</div>
            ) : products.length > 0 ? (
              <>
                <p className="text-sm text-text-secondary mb-4">
                  {t('catalog.showing')} {startItem}-{endItem} {t('catalog.of')} {total} {t('catalog.results')}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                  {products.map(product => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    currentPage={filters.page || 1}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                       const newFilters = { ...filters, page };
                       setFilters(newFilters);
                       updateUrl(newFilters);
                       window.scrollTo(0, 0);
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                <p className="text-lg text-text-secondary">{t('catalog.noResults')}</p>
              </div>
            )}
          </main>
        </div>
      </Container>
    </div>
  );
};

export default CatalogPage;