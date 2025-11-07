import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { getFeaturedProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/SkeletonLoader';
import { ROUTES } from '../constants';

// Esta é a Página Inicial (HomePage). É a primeira coisa que o visitante vê.
const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect para buscar os produtos em destaque quando a página carregar.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getFeaturedProducts();
        setFeaturedProducts(products);
      } catch (error: any) {
        console.error("Failed to fetch featured products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {/* 1. Seção Hero: A grande imagem de impacto no topo */}
      <section className="relative h-[60vh] md:h-[80vh] bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/id/10/1800/1000')` }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold animate-fade-in-down">{t('home.heroTagline')}</h1>
        </div>
      </section>

      {/* 2. Seção de Introdução */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <p className="text-lg text-text-secondary leading-relaxed">
            {t('home.artistIntro')}
          </p>
        </div>
      </section>

      {/* 3. Seção da Galeria em Destaque */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">{t('home.featuredGallery')}</h2>
          
          {/* Mostra o esqueleto de carregamento ou os produtos */}
          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* 4. Botão de Call-to-Action */}
          <div className="text-center mt-16">
            <Link to={ROUTES.CATALOG} className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-colors duration-300">
              {t('home.exploreCatalog')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;