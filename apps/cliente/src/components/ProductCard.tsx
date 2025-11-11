import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@shared/types';
import { useTranslation } from '../hooks/useTranslation';

interface ProductCardProps {
  product: Product;
}

// Este componente representa um único "card" de produto na vitrine (página inicial ou catálogo).
const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { language, t } = useTranslation();
  const productTranslation = product.translations[language] || product.translations['fr'];

  // Return null or a placeholder if no translation is found
  if (!productTranslation) {
    return null;
  }

  // Formata o preço para o padrão europeu (ex: 1.200,00 €)
  const formattedPrice = new Intl.NumberFormat(language + '-LU', {
    style: 'currency',
    currency: product.currency,
  }).format(product.priceCents / 100);

  return (
    // O Link faz com que o card inteiro seja clicável, levando para a página de detalhes do produto.
    <Link to={`/product/${product.slug}`} className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-400">
      <div className="relative">
        {/* A imagem do produto */}
        <div className="overflow-hidden">
             <img
                src={product.cover_thumb}
                alt={product.gallery?.[0]?.alt || productTranslation.title}
                className="w-full h-72 object-cover transition-transform duration-400 ease-in-out group-hover:scale-105"
            />
        </div>

        {/* Overlay que aparece no hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-400 flex flex-col justify-end p-4">
             <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <h3 className="text-white text-xl font-heading font-semibold">{productTranslation.title}</h3>
                <p className="text-gray-200 mt-1">{formattedPrice}</p>
                <span className="mt-4 inline-block bg-secondary text-white text-xs font-bold py-2 px-4 rounded-md">
                    {t('home.viewDetails')}
                </span>
            </div>
        </div>
         {product.status === 'sold' && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full uppercase">
                {t('product.sold')}
            </div>
        )}
      </div>
      
      {/* Informações visíveis permanentemente abaixo do card */}
      <div className="p-4 bg-white">
          <h3 className="text-base font-semibold text-text-primary truncate">{productTranslation.title}</h3>
          <p className="text-sm text-text-secondary mt-1">{productTranslation.materials}</p>
          <p className="text-base font-bold text-primary mt-2">{formattedPrice}</p>
      </div>
    </Link>
  );
};

export default ProductCard;