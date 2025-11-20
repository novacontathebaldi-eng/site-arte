import React from 'react';
import { ProductDocument } from '../../firebase-types';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';
import { useWishlist } from '../../hooks/useWishlist';

const HeartIcon: React.FC<{isFilled: boolean} & React.SVGProps<SVGSVGElement>> = ({ isFilled, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

interface CatalogProductCardProps {
  product: ProductDocument;
}

const statusStyles: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    'made-to-order': 'bg-blue-100 text-blue-800',
};

const CatalogProductCard: React.FC<CatalogProductCardProps> = ({ product }) => {
  const { language, t } = useI18n();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';
  const statusText = t(`product.statuses.${product.status}`);
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
    <div className="group relative">
        <div className="overflow-hidden aspect-[3/4] bg-black/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
            <img
                src={imageUrl}
                alt={productName}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <Button as="a" href={`#/product/${product.id}`} variant="tertiary" size="sm" className="w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    View Details
                </Button>
            </div>
             <div className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-full ${statusStyles[product.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusText}
            </div>
             <button 
                onClick={handleWishlistToggle}
                className="absolute top-2 right-2 p-2 bg-white/50 backdrop-blur-sm rounded-full text-brand-black/70 hover:text-brand-black hover:bg-white/80 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Toggle Wishlist"
            >
                <HeartIcon isFilled={inWishlist} className={`w-5 h-5 transition-all ${inWishlist ? 'text-red-500' : ''}`} />
            </button>
        </div>
        <div className="mt-4">
            <a href={`#/product/${product.id}`}>
              <h3 className="text-md font-serif text-brand-black group-hover:text-brand-gold transition-colors">{productName}</h3>
            </a>
            <p className="mt-1 text-lg font-semibold">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
        </div>
    </div>
  );
};

export default CatalogProductCard;