
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, getTranslated } = useTranslation();

  return (
    <div className="group relative border border-border-color rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
      <Link to={`/product/${product.slug}`} className="block">
        <div className="overflow-hidden">
          <img
            src={product.images[0].url}
            alt={getTranslated(product, 'title')}
            className="w-full h-80 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-500 flex items-center justify-center">
            <div className="text-center text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="font-serif text-2xl font-semibold">{getTranslated(product, 'title')}</h3>
                <p className="mt-1 text-lg">€{product.price.amount.toFixed(2)}</p>
                <span className="mt-4 inline-block bg-secondary text-primary py-2 px-4 rounded-md text-sm font-semibold">
                    View Details
                </span>
            </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
