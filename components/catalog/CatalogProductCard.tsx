import React from 'react';
import { ProductDocument } from '../../firebase-types';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';

interface CatalogProductCardProps {
  product: ProductDocument;
}

const statusStyles: Record<string, string> = {
    available: 'bg-green-100 text-green-800',
    sold: 'bg-red-100 text-red-800',
    'made-to-order': 'bg-blue-100 text-blue-800',
};

const CatalogProductCard: React.FC<CatalogProductCardProps> = ({ product }) => {
  const { language, t } = useI18n();
  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';
  const statusText = t(`product.statuses.${product.status.replace('-', '')}`);

  return (
    <div className="group relative">
        <div className="overflow-hidden aspect-[3/4] bg-black/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
            <img
                src={imageUrl}
                alt={productName}
                loading="lazy"
                className="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                 <Button as="a" href={`#/product/${product.id}`} variant="tertiary" size="sm" className="w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-100">
                    View Details
                </Button>
            </div>
             <div className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${statusStyles[product.status] || 'bg-gray-100 text-gray-800'}`}>
                {statusText}
            </div>
        </div>
        <div className="mt-4">
            <h3 className="text-md font-serif text-brand-black group-hover:text-brand-gold transition-colors">{productName}</h3>
            <p className="mt-1 text-lg font-semibold">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
        </div>
    </div>
  );
};

export default CatalogProductCard;