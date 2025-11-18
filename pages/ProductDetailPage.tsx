import React, { useState } from 'react';
import { Product, AccordionItem } from '../types';
import { useI18n } from '../hooks/useI18n';
import Accordion from '../components/Accordion';
import { 
    ChevronLeftIcon, ChevronRightIcon, PlusIcon, HeartIcon, ShareIcon,
    CalendarIcon, TagIcon, BrushIcon, RulerIcon, ScaleIcon, CheckCircleIcon
} from '../components/icons';


interface ProductDetailPageProps {
  product: Product;
  onBackToCatalog: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, onBackToCatalog }) => {
  const { t, language } = useI18n();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const translation = product.translations[language] || product.translations.fr;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  }

  const accordionItems: AccordionItem[] = [
    {
      title: 'Description',
      content: <p>{translation.description}</p>
    },
    {
        title: 'Détails & Spécifications',
        content: (
            <ul className="space-y-3">
                <li className="flex items-center gap-3"><CalendarIcon /> <span>Année: {product.yearCreated}</span></li>
                <li className="flex items-center gap-3"><TagIcon /> <span>SKU: {product.sku}</span></li>
                <li className="flex items-center gap-3"><BrushIcon /> <span>Matériaux: {translation.materials}</span></li>
                <li className="flex items-center gap-3"><RulerIcon /> <span>Dimensions: {product.dimensions.height} x {product.dimensions.width} {product.dimensions.depth ? `x ${product.dimensions.depth}`: ''} cm</span></li>
                <li className="flex items-center gap-3"><ScaleIcon /> <span>Poids: {product.weight} kg</span></li>
                {product.certificateOfAuthenticity && <li className="flex items-center gap-3"><CheckCircleIcon className="text-green-600" /> <span>Certificat d'authenticité inclus</span></li>}
            </ul>
        )
    },
    {
      title: 'Livraison & Retours',
      content: <p>Livraison gratuite au Luxembourg. Retours sous 14 jours pour les clients de l'UE. Les pièces sur commande ne sont pas retournables.</p>
    }
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={onBackToCatalog} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary mb-6">
            <ChevronLeftIcon className="w-4 h-4" />
            Retour au catalogue
        </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="relative">
          <img 
            src={product.images[currentImageIndex].url} 
            alt={product.images[currentImageIndex].alt} 
            className="w-full h-auto object-cover rounded-lg shadow-lg" 
          />
          {product.images.length > 1 && (
            <>
            <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition">
                <ChevronLeftIcon />
            </button>
             <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full hover:bg-white transition">
                <ChevronRightIcon />
            </button>
            </>
          )}
           <div className="flex gap-2 mt-4">
               {product.images.map((img, index) => (
                   <img 
                    key={index}
                    src={img.thumbnail}
                    alt={img.alt}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${index === currentImageIndex ? 'border-primary' : 'border-transparent'}`}
                   />
               ))}
           </div>
        </div>

        {/* Product Info */}
        <div>
          <p className="text-sm uppercase text-gray-500">{t(`categories.${product.category}`)}</p>
          <h1 className="text-4xl font-serif text-primary mt-2 mb-4">{translation.title}</h1>
          <p className="text-3xl font-serif text-gray-800 mb-6">
            {new Intl.NumberFormat(language, { style: 'currency', currency: 'EUR' }).format(product.price.amount)}
          </p>
          
          {product.status === 'available' && (
            <div className="flex items-center gap-4 mb-8">
                 <button className="flex-grow bg-primary text-white px-8 py-3 rounded-md font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2">
                    <PlusIcon />
                    Ajouter au panier
                </button>
                 <button className="p-3 border rounded-md hover:bg-gray-100"><HeartIcon /></button>
                 <button className="p-3 border rounded-md hover:bg-gray-100"><ShareIcon /></button>
            </div>
          )}
          {product.status === 'sold' && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md mb-8">
                  Oeuvre vendue
              </div>
          )}
          {product.status === 'made-to-order' && (
              <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-md mb-8">
                  Disponible sur commande
              </div>
          )}


          <Accordion items={accordionItems} defaultOpenIndex={0} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
