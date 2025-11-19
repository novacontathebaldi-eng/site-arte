

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import ProductCard from './ProductCard';
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
        // FIX: Query only by the 'featured' flag to avoid needing a composite index.
        // We will filter by the published status on the client-side.
        // Fetch a few extra to increase the chance of getting 4 published items.
        const q = query(
            productsRef, 
            where('featured', '==', true), 
            limit(8)
        );
        const querySnapshot = await getDocs(q);
        
        const featuredProducts = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument))
            .filter(p => p.publishedAt) // Client-side filter for published products
            .slice(0, 4); // Ensure we only show a maximum of 4

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