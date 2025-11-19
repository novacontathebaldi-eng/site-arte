import React from 'react';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';

interface ProductCardProps {
  product: ProductDocument;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language } = useI18n();
  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';

  return (
    <a href={`#/product/${product.id}`} className="group relative block">
      <div className="overflow-hidden aspect-[3/4] bg-black/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
          <h3 className="text-md font-serif text-brand-black group-hover:text-brand-gold transition-colors">{productName}</h3>
          <p className="mt-1 text-lg font-semibold">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
      </div>
    </a>
  );
};

export default ProductCard;
