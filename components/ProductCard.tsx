import React from 'react';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';

interface ProductCardProps {
  product: ProductDocument;
}

const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>
);


const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, language } = useI18n();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product, 1);
      addToast(t('cart.added'), 'success');
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToWishlist(product);
      addToast(t('wishlist.added'), 'success');
  };

  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const categoryKey = `product.categories.${product.category}`;
  const imageUrl = product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="group relative">
      <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden bg-black/5">
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={handleAddToWishlist} className={`p-2 bg-brand-white/80 rounded-full text-brand-black/70 hover:bg-brand-white hover:text-brand-black backdrop-blur-sm ${inWishlist ? 'text-red-500 fill-current' : ''}`}>
                <HeartIcon className="w-5 h-5"/>
            </button>
            {product.status === 'available' && (
              <button onClick={handleAddToCart} className="p-2 bg-brand-white/80 rounded-full text-brand-black/70 hover:bg-brand-white hover:text-brand-black backdrop-blur-sm">
                  <PlusIcon className="w-5 h-5"/>
              </button>
            )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-serif text-brand-black">
          <a href={`#/product/${product.id}`} className="hover:text-brand-gold transition-colors">
            <span aria-hidden="true" className="absolute inset-0" />
            {productName}
          </a>
        </h3>
        <p className="mt-1 text-sm text-brand-black/60">{t(categoryKey)}</p>
        <p className="mt-2 text-md font-medium text-brand-black">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProductCard;