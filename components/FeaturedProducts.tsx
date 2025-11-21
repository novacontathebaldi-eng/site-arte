import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import Skeleton from './common/Skeleton';
import ProductCard from './ProductCard';
import Reveal from './common/Reveal';
import Button from './common/Button';

const FeaturedProducts: React.FC = () => {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef, where('featured', '==', true), where('publishedAt', '!=', null), limit(4));
        const querySnapshot = await getDocs(q);
        const featuredProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
        setProducts(featuredProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <section id="products" className="min-h-screen flex flex-col justify-center py-24 bg-brand-white dark:bg-brand-gray-900 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-brand-black dark:text-brand-white mb-6">
                    {t('productGrid.featuredTitle')}
                </h2>
                <div className="w-24 h-1 bg-brand-gold mx-auto rounded-full"></div>
            </div>
        </Reveal>

        {loading ? (
             <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mb-16">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[3/4]"/>)}
             </div>
        ) : (
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8 mb-16">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={`${index * 150}ms`} animation="scale-in">
                    <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
        )}
        
        <Reveal delay="200ms" animation="fade-in-up">
            <div className="flex justify-center">
                <Button as="a" href="#/catalog" variant="tertiary" size="lg" className="border-brand-black dark:border-brand-white hover:bg-brand-black hover:text-white dark:hover:bg-brand-white dark:hover:text-black">
                    {t('productGrid.viewCatalog')}
                </Button>
            </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturedProducts;