
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, CreditCard, Plus, Minus, ArrowRight, Heart } from 'lucide-react';
import { useUIStore, useCartStore, useAuthStore, useWishlistStore } from '../store';
import { useLanguage } from '../hooks/useLanguage';
import { ProductCategory } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { SuccessCheck } from './ui/SuccessCheck';
import { useWishlist } from '../hooks/useWishlist';

export const CartSidebar: React.FC = () => {
  const { isCartOpen, toggleCart, openAuthModal } = useUIStore();
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { t, language } = useLanguage();
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);

  // Reset success state when cart closes
  useEffect(() => {
    if (!isCartOpen) {
        const timer = setTimeout(() => setIsCheckoutSuccess(false), 500);
        return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  const handleCheckout = () => {
    if (!user) {
        openAuthModal('login');
    } else {
        setIsCheckoutSuccess(true);
        setTimeout(() => {
            clearCart();
        }, 800);
    }
  };

  const closeCart = () => {
    toggleCart();
  };

  const getImageUrl = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.src) return img.src;
    return '';
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={closeCart}
            {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            } as any)}
          />
          
          {/* Glass Sidebar */}
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-l border-white/20 z-[70] shadow-2xl flex flex-col"
            {...({
                initial: { x: '100%' },
                animate: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
                exit: { x: '100%', transition: { type: 'spring', damping: 25, stiffness: 300 } }
            } as any)}
          >
            {isCheckoutSuccess ? (
                // SUCCESS VIEW
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center h-full animate-fade-in">
                    <SuccessCheck size={120} className="mb-8" />
                    
                    <motion.div
                        {...({
                            initial: { opacity: 0, y: 20 },
                            animate: { opacity: 1, y: 0 },
                            transition: { delay: 0.8, duration: 0.6 }
                        } as any)}
                    >
                        <h2 className="font-serif text-3xl font-bold text-primary dark:text-white mb-2">
                            Pedido Confirmado
                        </h2>
                        <p className="text-gray-500 mb-12 text-sm uppercase tracking-wide">
                            Obrigado por adquirir uma obra de Melissa Pelussi.
                        </p>
                        
                        <button 
                            onClick={closeCart}
                            className="bg-accent text-white px-8 py-4 rounded-sm uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#b59328] transition-colors shadow-lg"
                        >
                            Continuar Explorando
                        </button>
                    </motion.div>
                </div>
            ) : (
                // CART VIEW
                <>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="font-serif text-2xl font-bold text-primary dark:text-white tracking-tight">
                            {t('cart.title')}
                        </h2>
                        <span className="text-xs text-accent font-bold uppercase tracking-widest">
                            {items.length} items selected
                        </span>
                    </div>
                    <button 
                        onClick={toggleCart} 
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-primary dark:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    </div>

                    {/* Items List - FIXED SCROLLING */}
                    <div 
                        className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain"
                        data-lenis-prevent // CRITICAL FIX
                    >
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-6">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                                <ShoppingBag size={48} className="opacity-20" />
                            </div>
                            <p className="text-lg font-medium">{t('cart.empty')}</p>
                            <button onClick={toggleCart} className="text-accent hover:underline uppercase tracking-widest text-xs font-bold">
                                {t('cart.start_shopping')}
                            </button>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {items.map((item) => {
                                const isUnique = item.category === ProductCategory.PAINTINGS || item.category === ProductCategory.SCULPTURES;
                                // Safeguard Translation
                                const translation = item.translations?.[language] || item.translations?.['fr'] || { title: 'Untitled' };
                                const imageUrl = getImageUrl(item.images?.[0]);
                                const inWishlist = isInWishlist(item.id);

                                return (
                                    <motion.div 
                                        key={item.id}
                                        className="flex gap-4 group"
                                        {...({
                                            layout: true,
                                            initial: { opacity: 0, y: 20 },
                                            animate: { opacity: 1, y: 0 },
                                            exit: { opacity: 0, x: -100 }
                                        } as any)}
                                    >
                                        {/* Thumbnail */}
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 shadow-sm bg-gray-100 dark:bg-white/5">
                                            {imageUrl && (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={translation.title} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-serif text-base font-bold text-primary dark:text-white leading-tight mb-1">
                                                    {translation.title}
                                                </h3>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    {item.category}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-end">
                                                {/* Smart Quantity Control */}
                                                {isUnique ? (
                                                    <span className="text-[10px] bg-accent/10 text-accent px-2 py-1 rounded border border-accent/20 uppercase tracking-wide font-bold">
                                                        Unique Piece
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-gray-100 dark:bg-white/10 rounded-full px-3 py-1">
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 flex items-center justify-center hover:text-accent transition-colors"
                                                        >
                                                            <Minus size={12} />
                                                        </button>
                                                        <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 flex items-center justify-center hover:text-accent transition-colors"
                                                        >
                                                            <Plus size={12} />
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="text-right">
                                                    <div className="font-serif font-bold text-primary dark:text-white">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-start">
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="text-gray-400 hover:text-red-500 p-1"
                                                title="Remove"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    toggleWishlist(item.id);
                                                    removeItem(item.id);
                                                }}
                                                className={cn(
                                                    "p-1 transition-colors",
                                                    inWishlist ? "text-accent hover:text-accent/80" : "text-gray-400 hover:text-accent"
                                                )}
                                                title="Save to Wishlist"
                                            >
                                                <Heart size={18} fill={inWishlist ? "currentColor" : "none"} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                    </div>

                    {/* Footer */}
                    {items.length > 0 && (
                        <div className="p-8 border-t border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/50 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-gray-500 uppercase tracking-widest text-xs">{t('cart.subtotal')}</span>
                                <span className="font-serif text-xl font-bold dark:text-white">{formatPrice(total())}</span>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-6 text-center">{t('cart.shipping_note')}</p>
                            
                            <button 
                                onClick={handleCheckout}
                                className="w-full bg-accent text-white py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#b59328] transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
                            >
                                {t('cart.checkout')}
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
