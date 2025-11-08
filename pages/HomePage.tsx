
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { getFeaturedProducts } from '../services/firestoreService';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const featuredProducts = await getFeaturedProducts();
      setProducts(featuredProducts);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/hero/1920/1080')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight animate-fade-in-down">{t('artist_tagline')}</h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl animate-fade-in-up">
            Discover unique artworks that bridge traditional and digital mediums, capturing the essence of modern European aesthetics.
          </p>
          <Link to="/catalog" className="mt-8 bg-secondary text-primary font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105">
            {t('explore_catalog')}
          </Link>
        </div>
      </section>

      {/* Featured Gallery */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-12">
            {t('featured_gallery')}
          </h2>
          {loading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
