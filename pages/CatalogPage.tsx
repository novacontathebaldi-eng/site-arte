
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';

// Esta é a página do Catálogo, onde todas as obras de arte são listadas.
const CatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para os filtros e ordenação
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Busca todos os produtos quando a página carrega.
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

  // useMemo é usado aqui para otimização. O código dentro dele só será
  // executado novamente se `products`, `categoryFilter` ou `sortOrder` mudarem.
  // Ele filtra e ordena a lista de produtos sem precisar buscar os dados novamente.
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // 1. Filtragem por categoria
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 2. Ordenação
    switch (sortOrder) {
      case 'priceLowHigh':
        result.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'priceHighLow':
        result.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [products, categoryFilter, sortOrder]);
  
  const categories = ['all', 'paintings', 'jewelry', 'digital', 'prints'];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-4">{t('catalog.title')}</h1>
        <p className="text-center text-text-secondary mb-12">{filteredAndSortedProducts.length} {t('catalog.resultsFound')}</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Barra lateral de filtros */}
          <aside className="w-full md:w-1/4 lg:w-1/5">
            <h2 className="text-xl font-bold mb-4">{t('catalog.filters')}</h2>
            <div>
              <h3 className="font-semibold mb-2">{t('catalog.category')}</h3>
              <ul className="space-y-1">
                {categories.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => setCategoryFilter(cat)}
                      className={`w-full text-left p-2 rounded-md transition-colors ${categoryFilter === cat ? 'bg-secondary text-white' : 'hover:bg-surface'}`}
                    >
                      {t(`catalog.${cat}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
          
          {/* Conteúdo principal: grade de produtos */}
          <main className="w-full md:w-3/4 lg:w-4/5">
            <div className="flex justify-end mb-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm">{t('catalog.sortBy')}:</label>
                <select 
                  id="sort"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="p-2 border rounded-md"
                >
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
          </main>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
