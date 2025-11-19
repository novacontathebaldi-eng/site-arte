import React from 'react';
import { ProductDocument } from '../../firebase-types';
import CatalogProductCard from './CatalogProductCard';

interface CatalogProductGridProps {
  products: ProductDocument[];
}

const CatalogProductGrid: React.FC<CatalogProductGridProps> = ({ products }) => {
  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-8">
      {products.map((product, index) => (
        <CatalogProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default CatalogProductGrid;
