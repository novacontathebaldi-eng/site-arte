import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import { useI18n } from '../hooks/useI18n';
import ProductGrid from './ProductGrid';

const FeaturedProducts: React.FC = () => {
  const { t } = useI18n();
  const [products, setProducts] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        // This query avoids composite index errors by filtering on one field and handling the rest client-side.
        const q = query(productsRef, 
            where('featured', '==', true),
            limit(10) // Fetch up to 10 featured items
        );
        const querySnapshot = await getDocs(q);
        
        const featuredProducts = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument))
            .filter(p => p.publishedAt) // Ensure they are published
            .sort((a, b) => (b.publishedAt as Timestamp).seconds - (a.publishedAt as Timestamp).seconds) // Sort by most recent
            .slice(0, 4); // Take the top 4

        setProducts(featuredProducts);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      }
      setLoading(false);
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div id="products" className="bg-brand-white">
      <div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-serif font-bold tracking-tight text-brand-black text-center mb-12">
          {t('productGrid.featuredTitle')}
        </h2>
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
};

export default FeaturedProducts;