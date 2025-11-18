
import React, { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { fetchFeaturedProducts } from '../services/productService';
import { Product } from '../types';
import { BotIcon } from '../components/icons';

interface HomePageProps {
  onNavigateToCatalog: () => void;
  onProductSelect: (product: Product) => void;
}

const ProductCard: React.FC<{ product: Product; onSelect: () => void, language: string }> = ({ product, onSelect, language }) => {
  const translation = product.translations[language] || product.translations['fr'];
  return (
    <div className="group cursor-pointer" onClick={onSelect}>
      <div className="overflow-hidden rounded-lg">
        <img 
          src={product.images[0].url} 
          alt={product.images[0].alt} 
          className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      <h3 className="mt-4 text-lg font-serif">{translation.title}</h3>
      <p className="text-sm text-gray-500">{new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(product.price.amount)}</p>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ onNavigateToCatalog, onProductSelect }) => {
  const { t, language } = useI18n();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await fetchFeaturedProducts(4);
        setFeaturedProducts(products);
      } catch (error) {
        console.error("Failed to load featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div className="space-y-16 md:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-4">{t('hero.tagline')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">{t('home.subtitle')}</p>
          <button 
            onClick={onNavigateToCatalog}
            className="bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
          >
            {t('home.title')}
          </button>
        </div>
      </section>

      {/* Featured Works */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif text-center mb-10">{t('featured.title')}</h2>
        {loading ? (
            <div className="text-center text-gray-500">Loading featured works...</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map(product => (
                <ProductCard 
                key={product.id} 
                product={product} 
                onSelect={() => onProductSelect(product)}
                language={language as 'fr' | 'en' | 'de' | 'pt'}
                />
            ))}
            </div>
        )}
      </section>

       {/* AI Assistant Promo */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-accent/10 rounded-lg p-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-accent text-white flex-shrink-0 flex items-center justify-center">
                <BotIcon className="w-8 h-8" />
            </div>
            <div>
                <h3 className="text-xl font-serif text-accent mb-1">Besoin d'aide ?</h3>
                <p className="text-gray-600">Mon assistant IA est disponible 24h/24 et 7j/7 pour répondre à vos questions sur les œuvres, la livraison ou les politiques. Cliquez sur l'icône de chat en bas à droite pour commencer !</p>
            </div>
        </div>
      </section>

      {/* About the Artist */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
         <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
                <img src="https://picsum.photos/id/1027/800/1000" alt="Melissa Pelussi" className="rounded-lg shadow-lg" />
            </div>
            <div>
                <h2 className="text-3xl font-serif mb-4">{t('about.title')}</h2>
                <p className="text-gray-600 leading-relaxed">{t('about.text')}</p>
            </div>
         </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif text-center mb-10">{t('categories.title')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['paintings', 'jewelry', 'digital', 'prints'].map(category => (
                <div key={category} onClick={onNavigateToCatalog} className="relative h-48 rounded-lg overflow-hidden cursor-pointer group">
                    <img src={`https://picsum.photos/seed/${category}/500/500`} alt={category} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <h3 className="text-white text-2xl font-serif">{t(`categories.${category}`)}</h3>
                    </div>
                </div>
            ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;