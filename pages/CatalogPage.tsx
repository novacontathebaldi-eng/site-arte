
import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/firestoreService';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';

const categories = ['all_categories', 'paintings', 'jewelry', 'digital_art', 'prints'];

const CatalogPage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all_categories');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const filter = activeCategory === 'all_categories' ? {} : { category: activeCategory.replace('_art','') };
      const fetchedProducts = await getProducts(filter);
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-24 p-6 bg-surface rounded-lg shadow-sm">
            <h3 className="text-xl font-serif font-semibold text-primary mb-4">{t('filter_by_category')}</h3>
            <ul className="space-y-2">
              {categories.map(category => (
                <li key={category}>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors text-sm ${
                      activeCategory === category
                        ? 'bg-secondary text-primary font-semibold'
                        : 'text-text-secondary hover:bg-border-color'
                    }`}
                  >
                    {t(category)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="w-full lg:w-3/4">
          {loading ? (
            <div className="flex items-center justify-center h-96">
                <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CatalogPage;
