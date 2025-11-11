import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Product, Filters } from '../types';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { XIcon } from '../components/ui/icons';
import { useDebounce } from '../hooks/useDebounce';

const CatalogPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    query: '',
    category: 'all',
    availability: 'all',
  });
  const debouncedQuery = useDebounce(filters.query, 300);

  const [sortOrder, setSortOrder] = useState<string>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleFilterChange = (filterName: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (debouncedQuery) {
      result = result.filter(p =>
        // FIX: Use optional chaining to prevent error if translation is missing.
        p.translations[language]?.title
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase())
      );
    }

    // Filter by category
    if (filters.category !== 'all') {
      // FIX: Check categories array instead of single category property
      result = result.filter(p => p.categories?.includes(filters.category));
    }
    
    // Filter by availability
    if (filters.availability !== 'all') {
        result = result.filter(p => p.status === filters.availability);
    }

    // Sorting
    switch (sortOrder) {
      case 'priceLowHigh':
        result.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case 'priceHighLow':
        result.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case 'newest':
      default:
        // FIX: Sort by seconds from Firestore timestamp object
        result.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        break;
    }

    return result;
  }, [products, debouncedQuery, filters, sortOrder, language]);

  const categories = ['all', 'paintings', 'jewelry', 'digital', 'prints'];
  const availabilities = ['all', 'available', 'sold', 'madeToOrder'];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-12">{t('catalog.title')}</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="space-y-6">
               <input
                type="text"
                placeholder={t('catalog.searchPlaceholder')}
                value={filters.query}
                // FIX: Explicitly type event to correctly infer target type
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('query', e.target.value)}
                className="w-full p-2 border rounded-md"
              />
              <div>
                <h3 className="font-semibold mb-2">{t('catalog.category')}</h3>
                <ul className="space-y-1">
                  {categories.map(cat => (
                    <li key={cat}>
                      <button 
                        onClick={() => handleFilterChange('category', cat)}
                        className={`w-full text-left p-2 rounded-md transition-colors ${filters.category === cat ? 'bg-secondary text-white' : 'hover:bg-surface'}`}
                      >
                        {t(`catalog.${cat}`)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
               <div>
                  <h3 className="font-semibold mb-2">{t('catalog.availability')}</h3>
                   {availabilities.map(avail => (
                       <label key={avail} className="flex items-center space-x-2">
                           <input type="radio" name="availability" value={avail} checked={filters.availability === avail} // FIX: Explicitly type event to correctly infer target type
                           onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('availability', e.target.value)} />
                           <span>{t(avail === 'all' ? 'catalog.all' : `product.${avail}`)}</span>
                       </label>
                   ))}
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="w-full lg:w-3/4 xl:w-4/5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
               <div className="flex-grow flex items-center gap-2 flex-wrap mb-4 sm:mb-0">
                    <span className="font-semibold text-sm">{filteredAndSortedProducts.length} {t('catalog.resultsFound')}</span>
                    {filters.category !== 'all' && (
                        <span className="bg-gray-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            {t(`catalog.${filters.category}`)}
                            <button onClick={() => handleFilterChange('category', 'all')}><XIcon className="w-3 h-3"/></button>
                        </span>
                    )}
                    {filters.availability !== 'all' && (
                         <span className="bg-gray-200 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                            {t(`product.${filters.availability}`)}
                            <button onClick={() => handleFilterChange('availability', 'all')}><XIcon className="w-3 h-3"/></button>
                        </span>
                    )}
               </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <label htmlFor="sort" className="text-sm">{t('catalog.sortBy')}:</label>
                <select id="sort" value={sortOrder} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortOrder(e.target.value)} className="p-2 border rounded-md">
                  <option value="newest">{t('catalog.newest')}</option>
                  <option value="priceLowHigh">{t('catalog.priceLowHigh')}</option>
                  <option value="priceHighLow">{t('catalog.priceHighLow')}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <ProductGridSkeleton count={9} />
            ) : filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredAndSortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg text-text-secondary">{t('catalog.noResults')}</p>
              </div>
            )}
            {/* Pagination will be added here */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;