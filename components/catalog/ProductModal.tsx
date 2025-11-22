import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/product';
import { useLanguage } from '../../hooks/useLanguage';
import { useCartStore } from '../../store';
import { formatPrice, cn } from '../../lib/utils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const { addItem } = useCartStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  if (!product || !isOpen) return null;

  const translation = product.translations[language] || 
                      product.translations['fr'] || 
                      product.translations['en'] || 
                      { title: 'Untitled', description: '', material: '' };

  const isSoldOut = product.status === 'sold' || product.stock <= 0;

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const nextImage = () => {
    if (product.images.length > 0) {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product.images.length > 0) {
        setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Heavy Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            layoutId={`product-${product.id}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl bg-white dark:bg-[#1a1a1a] shadow-2xl overflow-hidden flex flex-col md:flex-row rounded-lg max-h-[90vh] md:h-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur rounded-full p-2 text-primary dark:text-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* Left: Image Gallery */}
            <div className="w-full md:w-3/5 bg-gray-100 dark:bg-black/20 relative group h-[40vh] md:h-auto md:min-h-[500px]">
              <motion.img
                key={currentImageIndex}
                src={product.images[currentImageIndex]}
                alt={translation.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={24} />
                    </button>

                    {/* Thumbnails Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {product.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all shadow-sm",
                                    currentImageIndex === idx ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
                                )}
                            />
                        ))}
                    </div>
                  </>
              )}
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col overflow-y-auto">
              <div className="flex-1">
                <span className="text-accent text-xs font-bold uppercase tracking-widest mb-2 block">
                    {product.category}
                </span>
                <h2 className="font-serif text-3xl md:text-4xl text-primary dark:text-white mb-4">
                    {translation.title}
                </h2>
                
                <div className="flex items-baseline gap-4 mb-8 border-b border-gray-200 dark:border-white/10 pb-6">
                    <span className="text-2xl font-medium text-primary dark:text-white">
                        {formatPrice(product.price)}
                    </span>
                    {isSoldOut && (
                        <span className="text-red-500 text-xs font-bold uppercase tracking-wider border border-red-500 px-2 py-1 rounded-sm">
                            Sold Out
                        </span>
                    )}
                </div>

                <div className="space-y-6 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    <p>{translation.description}</p>
                    
                    {translation.material && (
                        <div>
                            <strong className="text-primary dark:text-white uppercase text-xs tracking-wider block mb-1">Material</strong>
                            {translation.material}
                        </div>
                    )}
                    
                    {product.dimensions && (
                         <div>
                            <strong className="text-primary dark:text-white uppercase text-xs tracking-wider block mb-1">Dimensions</strong>
                            {product.dimensions}
                        </div>
                    )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-8 pt-6 flex flex-col gap-4">
                 <button
                    onClick={handleAddToCart}
                    disabled={isSoldOut || isAdded}
                    className={cn(
                        "w-full py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
                        isSoldOut 
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5" 
                            : isAdded
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-accent text-white hover:bg-[#b59328] hover:shadow-xl hover:-translate-y-1"
                    )}
                 >
                    {isAdded ? (
                        <><Check size={18} /> Added to Cart</>
                    ) : (
                        <><ShoppingBag size={18} /> {isSoldOut ? 'Unavailable' : 'Add to Collection'}</>
                    )}
                 </button>
                 
                 <button className="w-full py-3 text-gray-400 hover:text-primary dark:hover:text-white text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                    <Heart size={16} /> Add to Wishlist
                 </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
