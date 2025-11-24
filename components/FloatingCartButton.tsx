
import React, { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore, useCartStore } from '../store';

export const FloatingCartButton: React.FC = () => {
  const { toggleCart, isCartOpen } = useUIStore();
  const { items } = useCartStore();
  const [isAboveFooter, setIsAboveFooter] = useState(true);
  const [isPopping, setIsPopping] = useState(false);

  const hasItems = items.length > 0;

  // Trigger "Pop" effect when items change
  useEffect(() => {
    if (hasItems) {
        setIsPopping(true);
        const timer = setTimeout(() => setIsPopping(false), 300);
        return () => clearTimeout(timer);
    }
  }, [items.length, hasItems]);

  // Hide FAB when footer is reached
  useEffect(() => {
    const handleScroll = () => {
        const footer = document.querySelector('footer');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            // Adicionado buffer de 100px para suavizar a transição antes do footer
            setIsAboveFooter(footerRect.top > window.innerHeight + 50);
        }
    };
    
    // Executa verificação inicial
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Condição mestre de visibilidade
  const shouldShow = hasItems && !isCartOpen && isAboveFooter;

  return (
    <AnimatePresence>
        {shouldShow && (
            <motion.button
                id="floating-cart-btn"
                onClick={toggleCart}
                className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-xl text-primary dark:text-white rounded-full shadow-2xl border border-white/20 flex items-center justify-center group"
                {...({
                    initial: { scale: 0, opacity: 0, y: 20 },
                    animate: { 
                        scale: isPopping ? 1.2 : 1, // POP EFFECT
                        opacity: 1,
                        y: 0
                    },
                    exit: { 
                        scale: 0, 
                        opacity: 0, 
                        y: 20, 
                        transition: { duration: 0.3 } 
                    },
                    whileHover: { scale: 1.1 },
                    whileTap: { scale: 0.9 }
                } as any)}
            >
                <ShoppingBag size={24} className="group-hover:text-accent transition-colors" />
                
                {/* Pulse Badge */}
                <span className="absolute top-0 right-0 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-accent text-[10px] text-white font-bold items-center justify-center">
                        {items.length}
                    </span>
                </span>
            </motion.button>
        )}
    </AnimatePresence>
  );
};
