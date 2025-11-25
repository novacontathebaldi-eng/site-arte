
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Check, ChevronLeft, ChevronRight, ZoomIn, ShieldCheck, Globe, Star, MessageSquare } from 'lucide-react';
import { Product } from '../../types/product';
import { useLanguage } from '../../hooks/useLanguage';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useProducts } from '../../hooks/useProducts';
import { useUIStore } from '../../store';
import { formatPrice, cn } from '../../lib/utils';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (p: Product) => void;
}

const MagnifierImage = ({ src, alt }: { src: string, alt: string }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        
        // Calculate relative position (0 to 1)
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        setPosition({ x, y });
        setCursorPosition({ x: e.clientX - left, y: e.clientY - top });
        setShowMagnifier(true);
    };

    return (
        <div 
            className="relative w-full h-full overflow-hidden cursor-crosshair group bg-gray-100 dark:bg-white/5"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowMagnifier(false)}
            onTouchStart={() => setShowMagnifier(false)} // Disable on touch/mobile
        >
            <img 
                ref={imgRef}
                src={src}
                alt={alt}
                className="w-full h-full object-cover transition-transform duration-500"
            />
            
            {/* Magnifier Lens / Zoom Overlay */}
            <AnimatePresence>
                {showMagnifier && (
                    <motion.div 
                        {...({
                            initial: { opacity: 0, scale: 0.8 },
                            animate: { opacity: 1, scale: 1 },
                            exit: { opacity: 0, scale: 0.8 },
                            transition: { duration: 0.2 }
                        } as any)}
                        className="absolute hidden md:block w-48 h-48 rounded-full border-2 border-accent/50 shadow-2xl pointer-events-none z-20 bg-no-repeat bg-cover"
                        style={{
                            left: `${cursorPosition.x - 96}px`,
                            top: `${cursorPosition.y - 96}px`,
                            backgroundImage: `url(${src})`,
                            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
                            backgroundSize: '250%' // Zoom level
                        }}
                    >
                        <div className="absolute inset-0 rounded-full bg-accent/5" />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded backdrop-blur-sm pointer-events-none md:group-hover:opacity-0 transition-opacity flex items-center gap-1">
                <ZoomIn size={12} /> Hover to Zoom
            </div>
        </div>
    );
};

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose, onSelectProduct }) => {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { openChatWithContext } = useUIStore();
  const { data: allProducts } = useProducts();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  
  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id]);

  if (!product || !isOpen) return null;

  // Safeguard Translation
  const translation = product.translations?.[language] || 
                      product.translations?.['fr'] || 
                      product.translations?.['en'] || 
                      { title: 'Untitled', description: '', material_label: '' };

  const isSoldOut = product.status === 'sold' || product.stock <= 0;
  const inWishlist = isInWishlist(product.id);
  const images = product.images || [];

  // Get Related Products
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleConsultCurator = () => {
    const msg = `Olá! Tenho interesse na obra "${translation.title}" (Ref: ${product.sku}). Poderia me dar mais detalhes sobre ela?`;
    onClose();
    setTimeout(() => openChatWithContext(msg), 300); // Slight delay for smoother transition
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
          
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md pointer-events-auto"
            onClick={onClose}
            {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            } as any)}
          />

          {/* Modal Content */}
          <motion.div
            className="pointer-events-auto relative w-full md:max-w-6xl h-[92vh] md:h-[85vh] bg-white dark:bg-[#121212] md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
            {...({
                initial: { y: "100%" },
                animate: { y: 0 },
                exit: { y: "100%" },
                transition: { type: 'spring', damping: 25, stiffness: 200 }
            } as any)}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-primary dark:text-white transition-all hover:rotate-90 shadow-lg"
            >
              <X size={24} />
            </button>

            {/* --- LEFT COLUMN: GALLERY (60%) --- */}
            <div className="w-full md:w-[60%] h-[40vh] md:h-full bg-gray-100 dark:bg-black/40 relative flex flex-col">
                <div className="flex-1 relative overflow-hidden">
                    {images.length > 0 && (
                        <MagnifierImage 
                            src={typeof images[currentImageIndex] === 'string' ? images[currentImageIndex] as any : images[currentImageIndex].url}
                            alt={translation.title}
                        />
                    )}

                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                        <>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur p-2 rounded-full text-white transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % images.length); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/50 backdrop-blur p-2 rounded-full text-white transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails (Desktop Only) */}
                {images.length > 1 && (
                    <div className="hidden md:flex gap-2 p-4 bg-[#0a0a0a] justify-center overflow-x-auto">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={cn(
                                    "w-16 h-16 rounded border-2 transition-all overflow-hidden relative",
                                    currentImageIndex === idx ? "border-accent opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                                )}
                            >
                                <img 
                                    src={typeof img === 'string' ? img as any : img.url} 
                                    className="w-full h-full object-cover" 
                                    alt="" 
                                />
                            </button>
                        ))}
                    </div>
                )}
                
                {/* Mobile Dots */}
                {images.length > 1 && (
                    <div className="flex md:hidden justify-center gap-2 p-2 absolute bottom-0 w-full bg-gradient-to-t from-black/50 to-transparent">
                        {images.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={cn("w-1.5 h-1.5 rounded-full", currentImageIndex === idx ? "bg-white" : "bg-white/40")} 
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN: INFO & ACTIONS (40%) --- */}
            <div className="w-full md:w-[40%] flex flex-col h-[60vh] md:h-full bg-white dark:bg-[#121212] border-l border-white/5 relative">
                
                {/* Scrollable Info */}
                <div 
                    className="flex-1 overflow-y-auto p-6 md:p-10"
                    data-lenis-prevent
                >
                    <div className="mb-8">
                        <span className="text-accent text-xs font-bold uppercase tracking-[0.2em] mb-2 block">
                            {product.category}
                        </span>
                        <h2 className="font-serif text-3xl md:text-4xl text-primary dark:text-white leading-tight mb-2">
                            {translation.title}
                        </h2>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Ref: {product.sku}</p>
                    </div>

                    <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100 dark:border-white/5">
                        <span className="text-3xl font-serif text-primary dark:text-white">
                            {formatPrice(product.price)}
                        </span>
                        {isSoldOut ? (
                            <span className="bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded">
                                Sold Out
                            </span>
                        ) : (
                            <span className="bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Available
                            </span>
                        )}
                    </div>

                    <div className="space-y-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                        <p>{translation.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div>
                                <strong className="block text-primary dark:text-white text-xs uppercase tracking-wider mb-1">Dimensions</strong>
                                {typeof product.dimensions === 'object' 
                                    ? `${product.dimensions.height} x ${product.dimensions.width} ${product.dimensions.depth ? `x ${product.dimensions.depth}` : ''} ${product.dimensions.unit}` 
                                    : product.dimensions}
                            </div>
                            <div>
                                <strong className="block text-primary dark:text-white text-xs uppercase tracking-wider mb-1">Material</strong>
                                {translation.material_label || product.medium}
                            </div>
                            <div>
                                <strong className="block text-primary dark:text-white text-xs uppercase tracking-wider mb-1">Year</strong>
                                {product.year}
                            </div>
                            <div>
                                <strong className="block text-primary dark:text-white text-xs uppercase tracking-wider mb-1">Authenticity</strong>
                                {product.authenticity_certificate ? 'Certificate Included' : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-8 py-6 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/5">
                        <div className="flex flex-col items-center text-center px-2">
                            <ShieldCheck className="text-accent mb-2" size={20} />
                            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Secure Payment</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 border-l border-gray-200 dark:border-white/10">
                            <Globe className="text-accent mb-2" size={20} />
                            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Global Shipping</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 border-l border-gray-200 dark:border-white/10">
                            <Star className="text-accent mb-2" size={20} />
                            <span className="text-[10px] uppercase tracking-wide font-bold text-gray-400">Original Work</span>
                        </div>
                    </div>

                    {/* Cross Selling */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-12">
                            <h4 className="text-xs uppercase tracking-widest text-gray-500 mb-4 font-bold border-b border-white/5 pb-2">You May Also Like</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {relatedProducts.map(rp => (
                                    <div 
                                        key={rp.id} 
                                        className="group cursor-pointer"
                                        onClick={() => onSelectProduct?.(rp)}
                                    >
                                        <div className="aspect-square bg-gray-100 dark:bg-white/5 rounded overflow-hidden mb-2 relative">
                                            <img 
                                                src={typeof rp.images[0] === 'string' ? rp.images[0] : rp.images[0].url} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                                alt="" 
                                            />
                                        </div>
                                        <p className="text-[10px] truncate text-gray-400 group-hover:text-accent transition-colors">
                                            {rp.translations[language]?.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer Actions */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#1a1a1a] space-y-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                     <button
                        onClick={handleAddToCart}
                        disabled={isSoldOut || isAdded}
                        className={cn(
                            "w-full py-4 rounded-sm font-bold uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-lg",
                            isSoldOut 
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-white/5" 
                                : isAdded
                                    ? "bg-green-600 text-white"
                                    : "bg-accent text-white hover:bg-[#b59328] hover:shadow-accent/20"
                        )}
                     >
                        {isAdded ? (
                            <><Check size={18} /> Added to Collection</>
                        ) : (
                            <><ShoppingBag size={18} /> {isSoldOut ? 'Unavailable' : 'Add to Cart'}</>
                        )}
                     </button>
                     
                     <div className="flex gap-3">
                         <button 
                            onClick={() => toggleWishlist(product.id)}
                            className={cn(
                                "flex-1 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border rounded-sm",
                                inWishlist 
                                    ? "border-accent text-accent bg-accent/5" 
                                    : "border-gray-200 dark:border-white/10 text-gray-500 hover:border-gray-400 dark:hover:border-white/30"
                            )}
                         >
                            <Heart size={14} fill={inWishlist ? "currentColor" : "none"} /> 
                            Wishlist
                         </button>
                         <button 
                            onClick={handleConsultCurator}
                            className="flex-1 py-3 text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-gray-200 dark:border-white/10 text-gray-500 hover:text-white hover:bg-black hover:border-black dark:hover:bg-white dark:hover:text-black rounded-sm"
                         >
                            <MessageSquare size={14} /> 
                            Ask Curator
                         </button>
                     </div>
                </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
