
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useI18n } from '../hooks/useI18n';
import { FilterIcon, SearchIcon, ChevronDownIcon } from '../components/icons';
import { fetchProducts } from '../services/productService';

interface CatalogPageProps {
  onProductSelect: (product: Product) => void;
}

const ProductCard: React.FC<{ product: Product; onSelect: () => void, language: string }> = ({ product, onSelect, language }) => {
  const translation = product.translations[language] || product.translations['fr'];
  return (
    <div className="group cursor-pointer animate-fade-in" onClick={onSelect}>
      <div className="overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
        <img 
          src={product.images[0].thumbnail} 
          alt={product.images[0].alt} 
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <div className="p-2">
        <p className="text-xs text-gray-500 uppercase">{product.category}</p>
        <h3 className="mt-1 text-lg font-serif text-primary truncate">{translation.title}</h3>
        <p className="text-md font-semibold text-gray-700">{new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(product.price.amount)}</p>
      </div>
    </div>
  );
};


const CatalogPage: React.FC<CatalogPageProps> = ({ onProductSelect }) => {
  const { t, language } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        setError('Failed to load the artworks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-serif text-primary">Loading Artworks...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-4xl font-serif text-red-600">Error</h1>
        <p className="mt-4 text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-primary">{t('footer.catalog')}</h1>
        <p className="mt-2 text-gray-600">Découvrez des pièces uniques de l'artiste Melissa Pelussi.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <input 
            type="text" 
            placeholder="Rechercher une oeuvre..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
            <FilterIcon />
            <span>Filtres</span>
          </button>
           <button className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100">
            <span>Trier par</span>
            <ChevronDownIcon />
          </button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onSelect={() => onProductSelect(product)} 
            language={language}
          />
        ))}
      </div>
      <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CatalogPage;