import React from 'react';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import { useWishlist } from '../hooks/useWishlist';

const HeartIcon: React.FC<{isFilled: boolean} & React.SVGProps<SVGSVGElement>> = ({ isFilled, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);


interface ProductCardProps {
  product: ProductDocument;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language } = useI18n();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };


  return (
    <a href={`#/product/${product.id}`} className="group relative block">
      <div className="overflow-hidden aspect-[3/4] bg-black/5 dark:bg-white/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
         <button 
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 p-2 bg-white/50 dark:bg-brand-black/50 backdrop-blur-sm rounded-full text-brand-black/70 dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white hover:bg-white/80 dark:hover:bg-brand-black/80 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Toggle Wishlist"
        >
            <HeartIcon isFilled={inWishlist} className={`w-5 h-5 transition-all ${inWishlist ? 'text-red-500' : ''}`} />
        </button>
      </div>
      <div className="mt-4">
          <h3 className="text-md font-serif text-brand-black dark:text-brand-white group-hover:text-brand-gold transition-colors">{productName}</h3>
          <p className="mt-1 text-lg font-semibold">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
      </div>
    </a>
  );
};

export default ProductCard;
