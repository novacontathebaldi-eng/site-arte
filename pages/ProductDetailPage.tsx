import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductBySlug } from '../services/firestoreService';
import { Product } from '../types';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import { CartContext } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { language, getTranslated, t } = useTranslation();
  const cartContext = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      if (slug) {
        setLoading(true);
        const fetchedProduct = await getProductBySlug(slug);
        setProduct(fetchedProduct || null);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (product && (product.status === 'available' || product.status === 'made-to-order')) {
      cartContext?.addToCart(product, 1);
      toast.success(t('added_to_cart'));
    }
  };
  
  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
        case 'available':
            return <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('available')}</span>;
        case 'sold':
            return <span className="inline-block bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('sold')}</span>;
        case 'made-to-order':
            return <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{t('made_to_order')}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-serif text-primary">Artwork Not Found</h2>
        <p className="mt-2 text-text-secondary">The piece you are looking for does not exist or has been moved.</p>
        <Link to="/catalog" className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition-all duration-300">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <img 
            src={product.images[0].url} 
            alt={getTranslated(product, 'title')}
            className="w-full h-auto object-contain rounded-lg shadow-lg"
          />
          {/* Thumbnails would go here */}
        </div>

        {/* Product Information */}
        <div>
          <div className="text-sm text-text-secondary mb-2">
            <Link to="/catalog" className="hover:text-secondary">Catalog</Link> / 
            <span className="capitalize"> {product.category}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary">
            {getTranslated(product, 'title')}
          </h1>
          <p className="mt-2 text-lg text-text-secondary">{t('by_artist')}</p>

          <p className="mt-4 text-4xl font-serif text-secondary">
            €{product.price.amount.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center gap-4">
              {getStatusBadge(product.status)}
              {product.certificateOfAuthenticity && 
                <span className="text-sm text-accent flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM12 12a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /><path d="M11 6a1 1 0 10-2 0v1a1 1 0 102 0V6z" /></svg>
                    Certificate of Authenticity
                </span>}
          </div>

          <div className="mt-6 border-t border-border-color pt-6">
            <h2 className="text-xl font-serif font-semibold text-primary">Description</h2>
            <div className="mt-2 text-text-secondary leading-relaxed prose"
                 dangerouslySetInnerHTML={{ __html: getTranslated(product.translations[language], 'description')}}>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-primary">Details</h3>
            <ul className="mt-2 text-sm text-text-secondary space-y-1 list-disc list-inside">
                <li>Materials: {getTranslated(product.translations[language], 'materials')}</li>
                <li>Dimensions: {product.dimensions.height} x {product.dimensions.width} {product.dimensions.depth ? `x ${product.dimensions.depth}` : ''} cm</li>
                <li>Year: {product.yearCreated}</li>
            </ul>
          </div>

          <div className="mt-8">
            <button 
              onClick={handleAddToCart}
              disabled={product.status === 'sold'}
              className="w-full bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.status === 'sold' ? t('sold') : t('add_to_cart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;