import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/product';
import { useLanguage } from '../../hooks/useLanguage';
import { Eye, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, index }) => {
  const { t, language } = useLanguage();
  
  // Fallback translation logic
  const translation = product.translations[language] || 
                      product.translations['fr'] || 
                      product.translations['en'] || 
                      { title: 'Untitled', description: '' };

  const isSoldOut = product.status === 'sold' || product.stock <= 0;

  return (
    <motion.div
      layoutId={`product-${product.id}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }} // Stagger effect
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      {/* Image Container - Perfect Square */}
      <div className="aspect-square overflow-hidden relative bg-gray-100 dark:bg-white/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-2xl">
        {product.images?.[0] ? (
          <motion.img
            src={product.images[0]}
            alt={translation.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs uppercase">
            No Image
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Floating Badge */}
        {isSoldOut && (
            <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest z-20">
                Sold
            </div>
        )}

        {/* Hover Actions (Centered) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
                <Eye size={20} />
            </div>
        </div>

        {/* Slide Up Content */}
        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-20">
            <h3 className="text-white font-serif text-lg mb-1 truncate">{translation.title}</h3>
            <div className="flex justify-between items-center">
                <span className="text-accent font-medium text-sm">
                    {formatPrice(product.price)}
                </span>
                {!isSoldOut && <ShoppingBag size={16} className="text-white/80" />}
            </div>
        </div>
      </div>

      {/* Mobile/Default Title (Visible when not hovering on desktop, always on mobile) */}
      <div className="mt-4 md:hidden">
        <h3 className="text-primary dark:text-white font-serif text-base">{translation.title}</h3>
        <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
      </div>
    </motion.div>
  );
};