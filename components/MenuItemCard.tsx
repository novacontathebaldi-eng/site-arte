import React, { useState, useRef, useEffect } from 'react';
import { Painting } from '../types';

interface PaintingCardProps {
    painting: Painting;
    onAddToCart: (painting: Painting) => void;
    isStoreOnline: boolean;
    isInCart: boolean;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({ painting, onAddToCart, isStoreOnline, isInCart }) => {
    const { name, description, price, imageUrl, badge, stockStatus, dimensions, technique, year, isPromotion, promotionalPrice } = painting;
    
    const isOutOfStock = stockStatus === 'out_of_stock';
    const hasPromo = isPromotion && promotionalPrice && promotionalPrice > 0;
    const finalPrice = hasPromo ? promotionalPrice! : price;

    const [wasAdded, setWasAdded] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);
    
    const handleAddToCart = () => {
        if (!isStoreOnline || wasAdded || isOutOfStock) return;
        
        onAddToCart(painting);
        setWasAdded(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = window.setTimeout(() => {
            setWasAdded(false);
        }, 1500);
    };

    const formatPrice = (p: number) => {
        return p.toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' });
    };

    const buttonClass = wasAdded
        ? 'bg-green-600 text-white font-bold py-2 px-5 rounded-lg transition-all cursor-default'
        : isInCart
        ? 'bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg transition-all cursor-default'
        : 'bg-brand-primary text-white font-bold py-2 px-5 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed';
        
    const buttonText = () => {
        if (isOutOfStock) return 'Vendu';
        if (wasAdded) return 'Ajouté !';
        if (isInCart) return 'Dans le panier';
        return 'Ajouter';
    };
        
    return (
        <div className="bg-brand-surface rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden border border-gray-200/80">
            <div className="relative">
                {hasPromo && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 text-xs font-bold rounded-full flex items-center gap-1 z-10 animate-pulse">
                        <i className="fas fa-tags text-xs"></i> PROMO
                    </span>
                )}
                
                {badge && !isInCart && (
                    <span className="absolute top-2 right-2 bg-brand-accent text-white px-2 py-0.5 text-xs font-bold rounded-full">
                        {badge}
                    </span>
                )}

                <img src={imageUrl} alt={name} className="w-full aspect-square object-cover" loading="lazy" />
                
                 {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-1 font-bold rounded-full text-sm">VENDU</span>
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <h3 className="text-lg font-serif font-bold text-text-primary mb-1">{name} ({year})</h3>
                    <p className="text-text-secondary text-xs mb-1">{technique} - {dimensions}</p>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{description}</p>
                </div>

                <div className="mt-auto pt-2 flex justify-between items-center">
                     <div className="flex flex-col items-start">
                        {hasPromo && promotionalPrice ? (
                            <>
                                <span className="text-sm text-gray-400 line-through">{formatPrice(price)}</span>
                                <span className="text-2xl font-bold text-red-600 -mt-1">{formatPrice(promotionalPrice)}</span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-brand-secondary">{price ? formatPrice(price) : ''}</span>
                        )}
                    </div>
                    <button 
                        onClick={handleAddToCart}
                        disabled={!isStoreOnline || wasAdded || isOutOfStock || isInCart}
                        className={buttonClass}
                    >
                        {buttonText()}
                    </button>
                </div>
            </div>
        </div>
    );
};
