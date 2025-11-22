import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

export const AddToCartAnimation: React.FC = () => {
  const { flyAnimation, resetFlyAnimation } = useCartStore();
  const [targetRect, setTargetRect] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    // Find the Floating Cart Button (FAB) or Header Cart Icon position
    // Priority: FAB (id="floating-cart-btn") -> Header Icon (id="header-cart-btn")
    const updateTarget = () => {
        const fab = document.getElementById('floating-cart-btn');
        const headerBtn = document.getElementById('header-cart-btn');
        const target = fab || headerBtn;
        
        if (target) {
            const rect = target.getBoundingClientRect();
            setTargetRect({ 
                x: rect.left + rect.width / 2, 
                y: rect.top + rect.height / 2 
            });
        }
    };

    if (flyAnimation.isActive) {
        updateTarget();
        // Listen to resize just in case
        window.addEventListener('resize', updateTarget);
    }

    return () => window.removeEventListener('resize', updateTarget);
  }, [flyAnimation.isActive]);

  return (
    <AnimatePresence onExitComplete={resetFlyAnimation}>
      {flyAnimation.isActive && flyAnimation.startRect && targetRect && (
        <motion.img
            src={flyAnimation.image}
            initial={{ 
                position: 'fixed',
                top: flyAnimation.startRect.top,
                left: flyAnimation.startRect.left,
                width: flyAnimation.startRect.width,
                height: flyAnimation.startRect.height,
                opacity: 1,
                zIndex: 9999,
                borderRadius: '0px'
            }}
            animate={{
                top: targetRect.y - 10, // Center adjustment
                left: targetRect.x - 10,
                width: 20,
                height: 20,
                opacity: 0,
                borderRadius: '50%',
                rotate: 360
            }}
            transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Bezier ease out
            }}
            className="pointer-events-none shadow-2xl object-cover"
        />
      )}
    </AnimatePresence>
  );
};