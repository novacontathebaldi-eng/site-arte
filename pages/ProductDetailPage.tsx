
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { Product } from '../types';
import { getProductBySlug } from '../services/api';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import NotFoundPage from './NotFoundPage';

// Esta é a Página de Detalhes do Produto. Ela mostra todas as informações de uma única obra.
const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Pega o 'slug' do produto da URL.
  const { language, t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Busca os detalhes do produto específico usando o slug.
  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(false);
        const fetchedProduct = await getProductBySlug(slug);
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  // Se estiver carregando, mostra o esqueleto.
  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  // Se deu erro ou o produto não foi encontrado, mostra a página 404.
  if (error || !product) {
    return <NotFoundPage />;
  }

  const productTranslation = product.translations[language];
  const formattedPrice = new Intl.NumberFormat(language + '-LU', {
    style: 'currency',
    currency: 'EUR',
  }).format(product.price.amount);

  const statusInfo = {
    available: { text: t('product.available'), color: 'bg-green-100 text-green-800' },
    sold: { text: t('product.sold'), color: 'bg-red-100 text-red-800' },
    'made-to-order': { text: t('product.madeToOrder'), color: 'bg-yellow-100 text-yellow-800' },
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna da Esquerda: Galeria de Imagens */}
          <div>
            <img 
              src={product.images[0].url} 
              alt={product.images[0].alt}
              className="w-full rounded-lg shadow-lg"
            />
            {/* Thumbnails podem ser adicionados aqui */}
          </div>

          {/* Coluna da Direita: Informações do Produto */}
          <div>
            <h1 className="text-4xl lg:text-5xl font-heading font-bold text-primary">{productTranslation.title}</h1>
            <p className="text-lg text-text-secondary mt-2">{t('product.byArtist')}</p>
            
            <p className="text-3xl font-bold text-secondary my-6">{formattedPrice}</p>
            
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${statusInfo[product.status].color}`}>
              {statusInfo[product.status].text}
            </span>

            <div className="mt-8 prose max-w-none text-text-secondary">
              <p>{productTranslation.description}</p>
            </div>
            
            <ul className="mt-8 space-y-2 text-sm text-text-secondary border-t pt-6">
              <li><strong>{t('product.year')}:</strong> {product.yearCreated}</li>
              <li><strong>{t('product.category')}:</strong> {t(`catalog.${product.category}`)}</li>
              <li><strong>{t('product.technique')}:</strong> {productTranslation.materials}</li>
              <li><strong>{t('product.dimensions')}:</strong> {product.dimensions.height} x {product.dimensions.width} {product.dimensions.depth ? `x ${product.dimensions.depth}` : ''} cm</li>
            </ul>

            {product.status === 'available' && (
              <button className="mt-8 w-full bg-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-opacity-80 transition-colors duration-300">
                {t('product.addToCart')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
