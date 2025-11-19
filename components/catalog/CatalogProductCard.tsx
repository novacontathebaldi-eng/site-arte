import React from 'react';
import { ProductDocument } from '../../firebase-types';
import { useI18n } from '../../hooks/useI18n';

interface CatalogProductCardProps {
  product: ProductDocument;
  index: number;
}

const StatusBadge: React.FC<{ status: ProductDocument['status'] }> = ({ status }) => {
    const { t } = useI18n();
    const statusMap = {
        'available': { text: t('product.statuses.available'), bg: 'bg-green-100', text_color: 'text-green-800' },
        'sold': { text: t('product.statuses.sold'), bg: 'bg-red-100', text_color: 'text-red-800' },
        'made-to-order': { text: t('product.statuses.madeToOrder'), bg: 'bg-blue-100', text_color: 'text-blue-800' }
    };
    const currentStatus = statusMap[status] || statusMap.available;
    return (
        <div className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${currentStatus.bg} ${currentStatus.text_color}`}>
            {currentStatus.text}
        </div>
    );
};


const CatalogProductCard: React.FC<CatalogProductCardProps> = ({ product, index }) => {
  const { t, language } = useI18n();
  const productName = product.translations?.[language]?.title || product.translations?.en?.title || 'Untitled Artwork';
  const imageUrl = product.images?.[0]?.url || 'https://placehold.co/600x800/2C2C2C/FFFFFF?text=Meeh';

  return (
    <a 
        href={`#/product/${product.id}`}
        className="group relative block animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
    >
      <style>{`
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
            opacity: 0; 
        }
      `}</style>
      <div className="overflow-hidden aspect-[3/4] bg-black/5 rounded-sm shadow-sm transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1">
        <img
          src={imageUrl}
          alt={productName}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
        <div className="absolute bottom-0 left-0 p-4 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
             <h3 className="text-lg font-serif">{productName}</h3>
             <p className="mt-2 text-md font-semibold">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
        </div>
        <StatusBadge status={product.status} />
      </div>
    </a>
  );
};

export default CatalogProductCard;
