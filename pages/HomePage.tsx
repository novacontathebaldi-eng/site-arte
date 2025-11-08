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

  const categories = [
    { name: 'paintings', img: 'https://picsum.photos/seed/paint/600/400' },
    { name: 'jewelry', img: 'https://picsum.photos/seed/jewel/600/400' },
    { name: 'digital_art', img: 'https://picsum.photos/seed/digital/600/400' },
    { name: 'prints', img: 'https://picsum.photos/seed/print/600/400' },
  ];

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

      {/* About the Artist Section */}
      <section className="bg-surface py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="order-2 md:order-1">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-4">{t('about_artist_home_title')}</h2>
                      <p className="text-text-secondary mb-6 leading-relaxed">{t('about_artist_home_text')}</p>
                      <Link to="/about" className="text-secondary font-semibold hover:underline">{t('read_more')} &rarr;</Link>
                  </div>
                  <div className="order-1 md:order-2">
                      <img src="https://picsum.photos/seed/meeh/800/800" alt="Melissa Pelussi" className="rounded-lg shadow-lg aspect-square object-cover" />
                  </div>
              </div>
          </div>
      </section>

      {/* Art Categories Section */}
      <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-center text-primary mb-12">{t('art_categories')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categories.map(cat => (
                      <Link to="/catalog" state={{ category: cat.name }} key={cat.name} className="group relative block rounded-lg overflow-hidden shadow-lg">
                          <img src={cat.img} alt={t(cat.name)} className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                              <h3 className="text-white text-2xl font-serif font-bold">{t(cat.name)}</h3>
                          </div>
                      </Link>
                  ))}
              </div>
          </div>
      </section>

      {/* Newsletter Signup Section */}
       <section className="bg-primary py-16 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-serif font-bold mb-2">{t('newsletter_title')}</h2>
              <p className="max-w-xl mx-auto mb-6 text-gray-300">{t('newsletter_text')}</p>
              <form className="max-w-md mx-auto flex">
                  <input type="email" placeholder={t('email_placeholder')} className="w-full px-4 py-3 rounded-l-md text-text-primary focus:outline-none focus:ring-2 focus:ring-secondary" />
                  <button type="submit" className="bg-secondary text-primary font-bold px-6 py-3 rounded-r-md hover:bg-opacity-90 transition-colors">{t('subscribe')}</button>
              </form>
          </div>
      </section>
    </div>
  );
};

export default HomePage;