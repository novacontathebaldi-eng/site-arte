
import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useCartStore } from '../store';

export const FloatingCartButton: React.FC = () => {
  const { toggleCart, isCartOpen } = useUIStore();
  const { items } = useCartStore();
  const [isVisible, setIsVisible] = useState(true);
  const [isPopping, setIsPopping] = useState(false);

  // Trigger "Pop" effect when items change
  useEffect(() => {
    if (items.length > 0) {
        setIsPopping(true);
        const timer = setTimeout(() => setIsPopping(false), 300);
        return () => clearTimeout(timer);
    }
  }, [items.length]);

  // Hide FAB when footer is reached or Cart is open
  useEffect(() => {
    const handleScroll = () => {
        const footer = document.querySelector('footer');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            setIsVisible(footerRect.top > window.innerHeight);
        }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show if cart is open
  if (isCartOpen) return null;

  return (
    <AnimatePresence>
        {isVisible && (
            <motion.button
                id="floating-cart-btn"
                onClick={toggleCart}
                className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl text-primary dark:text-white rounded-full shadow-2xl border border-white/20 flex items-center justify-center group transition-all"
                {...({
                    initial: { scale: 0, opacity: 0 },
                    animate: { 
                        scale: isPopping ? 1.3 : 1, // POP EFFECT
                        opacity: 1 
                    },
                    exit: { scale: 0, opacity: 0 },
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.9 }
                } as any)}
            >
                <ShoppingBag size={24} className="group-hover:text-accent transition-colors" />
                
                {/* Pulse Badge */}
                {items.length > 0 && (
                    <>
                        <span className="absolute top-0 right-0 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-accent text-[10px] text-white font-bold items-center justify-center">
                                {items.length}
                            </span>
                        </span>
                    </>
                )}
            </motion.button>
        )}
    </AnimatePresence>
  );
};
