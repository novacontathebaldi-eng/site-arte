import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../hooks/useCart';

const ShoppingBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const FloatingCartButton: React.FC = () => {
    const { totalItems, toggleCart, itemAddedCount } = useCart();
    const [isPulsing, setIsPulsing] = useState(false);
    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }
        
        if (totalItems > 0) {
            setIsPulsing(true);
            const timer = setTimeout(() => {
                setIsPulsing(false);
            }, 600); // Duration of the pulse animation

            return () => clearTimeout(timer);
        }
    }, [itemAddedCount, totalItems]);

    const isVisible = totalItems > 0;

    return (
        <div className={`fixed bottom-5 right-5 z-40 transition-all duration-300 ease-in-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
            <button 
                onClick={toggleCart} 
                className={`relative flex items-center justify-center w-16 h-16 bg-brand-black text-brand-white rounded-full shadow-lg transform hover:scale-110 transition-transform ${isPulsing ? 'animate-pulse-strong' : ''}`}
                aria-label={`Open cart with ${totalItems} items`}
            >
                <ShoppingBagIcon className="w-7 h-7" />
                {isVisible && (
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gold text-sm font-bold text-brand-black ring-2 ring-brand-white">
                        {totalItems}
                    </span>
                )}
            </button>
        </div>
    );
};

export default FloatingCartButton;
