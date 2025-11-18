'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLanguageStore } from '@/store/languageStore';
import { toast } from 'react-toastify';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const translation = product.translations[currentLanguage] || product.translations.fr;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.status !== 'available') {
      toast.info('This item is not available for purchase');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(product.id, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('Please log in to add items to your wishlist');
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        toast.info('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const getStatusBadge = () => {
    switch (product.status) {
      case 'available':
        return (
          <span className="badge-available">
            {t('available')}
          </span>
        );
      case 'sold':
        return (
          <span className="badge-sold">
            {t('sold')}
          </span>
        );
      case 'made-to-order':
        return (
          <span className="badge-made-to-order">
            {t('made-to-order')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    >
      <Link href={`/product/${product.slug}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images.length > 0 && !imageError ? (
            <Image
              src={product.images[0].url}
              alt={translation.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            {getStatusBadge()}
          </div>

          {/* Featured Badge */}
          {product.featured && (
            <div className="absolute top-4 right-4">
              <span className="badge bg-yellow-100 text-yellow-800">
                {t('featured')}
              </span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                <Eye className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {translation.title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {translation.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              {product.price.compareAtPrice && product.price.compareAtPrice > product.price.amount && (
                <span className="text-sm text-gray-500 line-through">
                  €{product.price.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-primary">
                €{product.price.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{product.materials}</span>
            <span>{product.yearCreated}</span>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || product.status !== 'available'}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t('add-to-cart')}
                </>
              )}
            </button>

            <button
              onClick={handleWishlistToggle}
              className={`p-2 border rounded-md transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
              />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};