
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useLanguage } from '../hooks/useLanguage';
import { ProductCard } from './catalog/ProductCard';
import { ProductModal } from './catalog/ProductModal';
import { Product } from '../types/product';

export const FeaturedCollection: React.FC = () => {
    const { t } = useLanguage();
    const { data: products, isLoading } = useProducts();
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const featuredProducts = products
        .filter(p => p.featured && p.status !== 'draft')
        .slice(0, 4);

    if (isLoading || featuredProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-24 bg-light dark:bg-[#1a1a1a] relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-white dark:from-black to-transparent opacity-50 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                    className="text-center mb-16"
                    {...({
                        initial: { opacity: 0, y: 20 },
                        whileInView: { opacity: 1, y: 0 },
                        viewport: { once: true },
                        transition: { duration: 0.8 }
                    } as any)}
                >
                    <div className="flex justify-center mb-4">
                        <Sparkles className="text-accent w-5 h-5" />
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-primary dark:text-white mb-6 tracking-tight">
                        {t('home.featured_title')}
                    </h2>
                    <div className="w-16 h-1 bg-accent mx-auto rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {featuredProducts.map((product, index) => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            index={index}
                            onClick={() => setSelectedProduct(product)}
                        />
                    ))}
                </div>

                <div className="flex justify-center">
                    <Link 
                        href="/catalog"
                        className="group relative px-8 py-4 bg-transparent border border-primary dark:border-white text-primary dark:text-white font-bold uppercase tracking-[0.2em] text-xs rounded-sm hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 flex items-center gap-3"
                    >
                        {t('home.view_catalog')}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <ProductModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)}
                onSelectProduct={(p) => setSelectedProduct(p)} 
            />
        </section>
    );
};
