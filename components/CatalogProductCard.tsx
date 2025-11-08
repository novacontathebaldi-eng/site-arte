import React from 'react';
import { Link } from 'react-router-dom';
import { SupabaseProduct } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface CatalogProductCardProps {
  product: SupabaseProduct;
}

const CatalogProductCard: React.FC<CatalogProductCardProps> = ({ product }) => {
  const { language, t } = useTranslation();
  
  const title = product.title?.[language] || product.title?.['en'] || 'Untitled';
  
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  const imageUrl = primaryImage?.image_url || 'https://picsum.photos/800';
  const imageAlt = primaryImage?.alt_text?.[language] || title;

  const formattedPrice = new Intl.NumberFormat(language + '-LU', {
    style: 'currency',
    currency: product.currency || 'EUR',
  }).format(product.price);

  return (
    <Link to={`/`} className="group block overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-400 bg-white">
      <div className="relative">
        <div className="overflow-hidden">
             <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-72 object-cover transition-transform duration-400 ease-in-out group-hover:scale-105"
            />
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-400 flex flex-col justify-end p-4">
             <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400">
                <h3 className="text-white text-xl font-heading font-semibold">{title}</h3>
                <p className="text-gray-200 mt-1">{formattedPrice}</p>
                <span className="mt-4 inline-block bg-secondary text-white text-xs font-bold py-2 px-4 rounded-md">
                    {t('home.viewDetails')}
                </span>
            </div>
        </div>
         {!product.available && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-full uppercase">
                {t('product.sold')}
            </div>
        )}
      </div>
      
      <div className="p-4">
          <h3 className="text-base font-semibold text-text-primary truncate">{title}</h3>
          <p className="text-sm text-text-secondary mt-1">{product.technique?.join(', ')}</p>
          <p className="text-base font-bold text-primary mt-2">{formattedPrice}</p>
      </div>
    </Link>
  );
};

export default CatalogProductCard;