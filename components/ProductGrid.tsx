import React from 'react';
import { ProductDocument } from '../firebase-types';
import ProductCard from './ProductCard';
import Skeleton from './common/Skeleton';

interface ProductGridProps {
  products: ProductDocument[];
  loading?: boolean;
  gridClass?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, loading, gridClass }) => {
  const defaultGridClass = "grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8";
  
  if (loading) {
     return (
        <div className={gridClass || defaultGridClass}>
            {[...Array(8)].map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-w-3 aspect-h-4 w-full" />
                <Skeleton className="h-6 w-3/4 mx-auto mt-4" />
                <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
              </div>
            ))}
        </div>
     );
  }

  if (products.length === 0) {
      return <div className="text-center py-20 text-brand-black/70 col-span-full">No products found matching your criteria.</div>
  }

  return (
    <div className={gridClass || defaultGridClass}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
