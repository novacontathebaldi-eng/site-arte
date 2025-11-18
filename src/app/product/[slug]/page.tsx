'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  X,
  Check,
  Truck,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useProductsStore } from '@/store/productsStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useLanguageStore } from '@/store/languageStore';
import { Product } from '@/types';
import { toast } from 'react-toastify';

export default function ProductPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { currentLanguage } = useLanguageStore();
  const { products, loadProducts } = useProductsStore();
  const { isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, loadProducts]);

  useEffect(() => {
    if (products.length > 0 && slug) {
      const foundProduct = products.find(p => p.slug === slug);
      setProduct(foundProduct || null);
    }
  }, [products, slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">{t('product-not-found')}</h2>
          <p className="text-gray-500 mb-8">{t('product-not-found-message')}</p>
          <a href="/catalog" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors">
            {t('back-to-catalog')}
          </a>
        </div>
      </div>
    );
  }

  const translation = product.translations[currentLanguage] || product.translations.fr;
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = async () => {
    if (product.status !== 'available') {
      toast.info('This item is not available for purchase');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(product.id, quantity);
      toast.success('Added to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <Check className="w-4 h-4 mr-1" />
            {t('available')}
          </span>
        );
      case 'sold':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {t('sold')}
          </span>
        );
      case 'made-to-order':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {t('made-to-order')}
          </span>
        );
      default:
        return null;
    }
  };

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <a href="/" className="hover:text-primary">{t('home')}</a>
            <span>/</span>
            <a href="/catalog" className="hover:text-primary">{t('catalog')}</a>
            <span>/</span>
            <span className="text-gray-900">{translation.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.images[selectedImage]?.url || '/placeholder.jpg'}
                alt={translation.title}
                fill
                className="object-cover cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              />
              
              {/* Zoom Indicator */}
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-70 transition-opacity">
                <ZoomIn className="w-5 h-5" />
              </div>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.url}
                    onClick={() => setSelectedImage(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors ${
                      index === selectedImage
                        ? 'border-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${translation.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Status */}
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
                {translation.title}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                {getStatusBadge()}
                <span className="text-sm text-gray-500">
                  {t('by')} Melissa Pelussi
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              {product.price.compareAtPrice && product.price.compareAtPrice > product.price.amount && (
                <span className="text-2xl text-gray-500 line-through">
                  €{product.price.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className="text-4xl font-bold text-primary">
                €{product.price.amount.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">
                {t('tax-included')}
              </span>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">{t('product-details')}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">{t('category')}:</span>
                  <span className="ml-2 text-gray-900 capitalize">{product.category}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('year')}:</span>
                  <span className="ml-2 text-gray-900">{product.yearCreated}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('materials')}:</span>
                  <span className="ml-2 text-gray-900">{translation.materials}</span>
                </div>
                <div>
                  <span className="text-gray-500">{t('dimensions')}:</span>
                  <span className="ml-2 text-gray-900">
                    {product.dimensions.height} × {product.dimensions.width}cm
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">{t('certificate')}:</span>
                  <span className="ml-2 text-green-600">
                    ✓ {t('certificate-included')}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{t('description')}</h3>
              <div className="prose prose-sm max-w-none text-gray-600">
                {translation.description}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Quantity */}
              {product.category === 'prints' && (
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">
                    {t('quantity')}:
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || product.status !== 'available'}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingToCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {t('add-to-cart')}
                    </>
                  )}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 border rounded-md transition-colors ${
                    isWishlisted
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`}
                  />
                </button>

                <button className="p-3 border border-gray-300 rounded-md text-gray-600 hover:border-primary hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Accordion Sections */}
            <div className="space-y-4">
              {/* Shipping Info */}
              <div className="bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Truck className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{t('shipping-info')}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeAccordion === 'shipping' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'shipping' && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-2">{t('shipping-description')}</p>
                    <ul className="space-y-1">
                      <li>• {t('luxembourg')}: 1-2 {t('days')}</li>
                      <li>• {t('eu')}: 3-7 {t('days')}</li>
                      <li>• {t('international')}: 10-20 {t('days')}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Return Policy */}
              <div className="bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('returns')}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{t('return-policy')}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeAccordion === 'returns' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'returns' && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p className="mb-2">{t('return-policy-description')}</p>
                    <ul className="space-y-1">
                      <li>• {t('14-day-return')}</li>
                      <li>• {t('original-condition')}</li>
                      <li>• {t('certificate-required')}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Authenticity Guarantee */}
              <div className="bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleAccordion('authenticity')}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="font-medium text-gray-900">{t('authenticity-guarantee')}</span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      activeAccordion === 'authenticity' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeAccordion === 'authenticity' && (
                  <div className="px-6 pb-4 text-sm text-gray-600">
                    <p>{t('authenticity-description')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-4xl max-h-full p-4">
            <Image
              src={product.images[selectedImage]?.url || '/placeholder.jpg'}
              alt={translation.title}
              width={800}
              height={800}
              className="object-contain"
            />
          </div>

          {/* Lightbox Navigation */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}