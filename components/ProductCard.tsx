import React from 'react';
import { Product } from '../types';
import { useI18n } from '../hooks/useI18n';

interface ProductCardProps {
  product: Product;
}

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>
);


const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useI18n();
  const productName = t(product.nameKey);

  return (
    <div className="group relative">
      <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden bg-stone-200">
        <img
          src={product.imageUrl}
          alt={productName}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white/80 rounded-full text-stone-700 hover:bg-white hover:text-stone-900 backdrop-blur-sm">
                <HeartIcon className="w-5 h-5"/>
            </button>
            <button className="p-2 bg-white/80 rounded-full text-stone-700 hover:bg-white hover:text-stone-900 backdrop-blur-sm">
                <PlusIcon className="w-5 h-5"/>
            </button>
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-serif text-stone-800">
          <a href="#">
            <span aria-hidden="true" className="absolute inset-0" />
            {productName}
          </a>
        </h3>
        <p className="mt-1 text-sm text-stone-500">{t(product.categoryKey)}</p>
        <p className="mt-2 text-md font-medium text-stone-900">€{product.price.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;
