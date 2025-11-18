'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight,
  Truck,
  Shield,
  X
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useProductsStore } from '@/store/productsStore';
import { CartItem } from '@/types';
import { toast } from 'react-toastify';

export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { cart, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { products, loadProducts } = useProductsStore();
  
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      loadProducts();
    }
  }, [products.length, loadProducts]);

  useEffect(() => {
    // Calculate cart totals
    const calculateTotals = () => {
      let subtotal = 0;
      const items = cart.items.map(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
          const itemTotal = product.price.amount * cartItem.quantity;
          subtotal += itemTotal;
          return {
            ...cartItem,
            product,
            total: itemTotal
          };
        }
        return null;
      }).filter(Boolean);

      setCartItems(items);
      setSubtotal(subtotal);
      setShipping(subtotal > 100 ? 0 : 25); // Free shipping over €100
    };

    calculateTotals();
  }, [cart.items, products]);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const product = products.find(p => p.id === productId);
    if (product && product.stock && newQuantity > product.stock) {
      toast.info(`Only ${product.stock} items available`);
      return;
    }

    await updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = async (productId: string) => {
    await removeItem(productId);
    toast.success('Item removed from cart');
  };

  const handleApplyDiscount = async () => {
    if (!discountCode) return;

    setIsApplyingDiscount(true);
    try {
      // This would call an API to validate the discount code
      // For now, we'll simulate a 10% discount
      if (discountCode.toUpperCase() === 'WELCOME10') {
        setDiscount(subtotal * 0.1);
        toast.success('Discount applied!');
      } else {
        toast.error('Invalid discount code');
      }
    } catch (error) {
      toast.error('Failed to apply discount code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?returnUrl=/checkout');
      return;
    }
    router.push('/checkout');
  };

  const total = subtotal + shipping - discount;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            {t('your-cart-is-empty')}
          </h2>
          <p className="text-gray-500 mb-8">
            {t('cart-empty-message')}
          </p>
          <button
            onClick={() => router.push('/catalog')}
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            {t('start-shopping')}
            <ChevronRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-2">
              {t('shopping-cart')}
            </h1>
            <p className="text-gray-600">
              {t('cart-items-count', { count: cart.items.length })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.product.images[0]?.url || '/placeholder.jpg'}
                        alt={item.product.translations.fr.title}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.product.translations.fr.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.product.translations.fr.materials}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.product.dimensions.height} × {item.product.dimensions.width}cm
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        disabled={item.product.stock && item.quantity >= item.product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-semibold text-lg text-primary">
                        €{item.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        €{item.product.price.amount.toFixed(2)} each
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
                  {t('order-summary')}
                </h2>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('discount-code')}
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder={t('enter-code')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    />
                    <button
                      onClick={handleApplyDiscount}
                      disabled={isApplyingDiscount}
                      className="px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-secondary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isApplyingDiscount ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('apply')
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('discount')}</span>
                      <span>-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span>{shipping === 0 ? t('free') : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('total')}</span>
                      <span className="text-primary">€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full mb-4 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  {isAuthenticated ? t('proceed-to-checkout') : t('login-to-checkout')}
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:border-primary hover:text-primary transition-colors"
                >
                  {t('continue-shopping')}
                </button>

                {/* Features */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-primary" />
                    <span>{t('free-shipping-over-100')}</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    <span>{t('secure-payment')}</span>
                  </div>
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2 text-primary" />
                    <span>{t('14-day-return')}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-medium text-gray-900 mb-4">{t('why-shop-with-us')}</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('authentic-artworks')}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('certificate-included')}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('artist-support')}</span>
                  </div>
                  <div className="flex items-start">
                    <Check className="w-4 h-4 mr-2 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{t('worldwide-shipping')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}