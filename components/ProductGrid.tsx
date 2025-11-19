import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { useI18n } from '../hooks/useI18n';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { t } = useI18n();

  return (
    <div id="products" className="bg-stone-50">
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-stone-900 text-center mb-12">
          {t('productGrid.title')}
        </h2>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGrid;
