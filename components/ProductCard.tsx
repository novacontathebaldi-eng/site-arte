import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { WishlistContext } from '../context/WishlistContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getTranslated, t } = useTranslation();
  const { user } = useAuth();
  const wishlistContext = useContext(WishlistContext);

  if (!wishlistContext) {
    return null; // or a fallback UI
  }

  const { isInWishlist, addToWishlist, removeFromWishlist } = wishlistContext;
  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
        toast.error("Please log in to use the wishlist.");
        return;
    }
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success(t('removed_from_wishlist'));
    } else {
      addToWishlist(product.id);
      toast.success(t('added_to_wishlist'));
    }
  };

  return (
    <div className="group relative border border-border-color rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg">
       {user && (
         <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 z-10 p-2 bg-white/70 rounded-full backdrop-blur-sm hover:bg-white transition-colors"
            aria-label={inWishlist ? t('remove_from_wishlist') : t('add_to_wishlist')}
        >
            <svg
            className={`w-5 h-5 transition-all ${inWishlist ? 'text-red-500 fill-current' : 'text-gray-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
            />
            </svg>
        </button>
       )}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="overflow-hidden aspect-square">
          <img
            src={product.cover_thumb}
            alt={getTranslated(product.translations.fr, 'title')}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-500 flex items-center justify-center">
            <div className="text-center text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <h3 className="font-serif text-2xl font-semibold">{getTranslated(product.translations.fr, 'title')}</h3>
                <p className="mt-1 text-lg">€{(product.priceCents / 100).toFixed(2)}</p>
                <span className="mt-4 inline-block bg-secondary text-primary py-2 px-4 rounded-md text-sm font-semibold">
                    {t('view_details')}
                </span>
            </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;