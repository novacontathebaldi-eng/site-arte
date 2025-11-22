import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, CreditCard } from 'lucide-react';
import { useUIStore, useCartStore, useAuthStore } from '../store';
import { useLanguage } from '../hooks/useLanguage';

export const Cart: React.FC = () => {
  const { isCartOpen, toggleCart } = useUIStore();
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const { user, login } = useAuthStore();
  const { t, language } = useLanguage();

  const handleCheckout = () => {
    if (!user) {
        alert("Please login to checkout");
        login();
    } else {
        alert("Proceeding to checkout flow (Revolut/Pix Integration)...");
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
          />
          <motion.div
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-[#1a1a1a] z-[60] shadow-2xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-primary dark:text-white">{t('cart.title')} ({items.length})</h2>
              <button onClick={toggleCart} className="text-gray-400 hover:text-primary dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                    <ShoppingBag size={64} className="opacity-20" />
                    <p>{t('cart.empty')}</p>
                    <button onClick={toggleCart} className="text-accent hover:underline">{t('cart.start_shopping')}</button>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4 bg-gray-50 dark:bg-white/5 p-4 rounded-lg"
                  >
                    <img 
                        src={item.images[0]} 
                        alt={item.translations[language].title} 
                        className="w-20 h-20 object-cover rounded-md" 
                    />
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <h3 className="font-serif text-sm font-bold text-primary dark:text-white pr-2">
                                {item.translations[language].title}
                            </h3>
                            <button 
                                onClick={() => removeItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                            <div className="flex items-center border border-gray-300 dark:border-white/20 rounded">
                                <button 
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-white/10 text-xs"
                                >-</button>
                                <span className="px-2 text-xs font-mono">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-white/10 text-xs"
                                >+</button>
                            </div>
                            <span className="font-bold text-accent">€ {item.price * item.quantity}</span>
                        </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#151515]">
                    <div className="flex justify-between items-center mb-4 text-sm">
                        <span className="text-gray-500">{t('cart.subtotal')}</span>
                        <span className="font-bold text-lg dark:text-white">€ {total().toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">{t('cart.shipping_note')}</p>
                    <button 
                        onClick={handleCheckout}
                        className="w-full bg-accent text-white py-4 font-bold uppercase tracking-widest hover:bg-[#b59328] transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
                    >
                        <CreditCard size={18} />
                        {t('cart.checkout')}
                    </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};