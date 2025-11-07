import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useWishlist } from '../../hooks/useWishlist';
import { Product } from '../../types';
import { getProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/SkeletonLoader';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { HeartIcon } from '../../components/ui/icons';

const WishlistPage: React.FC = () => {
  const { t } = useTranslation();
  const { wishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setIsLoading(true);
      try {
        const allProducts = await getProducts();
        const wishlistProductIds = new Set(wishlist.items.map(item => item.productId));
        const filteredProducts = allProducts.filter(p => wishlistProductIds.has(p.id));
        setWishlistProducts(filteredProducts);
      } catch (error: any) {
        console.error("Failed to fetch wishlist products:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('dashboard.wishlistTitle')}</h1>
      
      {isLoading ? (
        <ProductGridSkeleton count={3} />
      ) : wishlistProducts.length === 0 ? (
        <div className="text-center py-16">
            <HeartIcon className="w-16 h-16 mx-auto text-gray-300" />
          <p className="text-xl text-text-secondary mt-4 mb-2">{t('dashboard.noWishlistItems')}</p>
          <p className="text-text-secondary mb-6">{t('dashboard.startWishlisting')}</p>
          <Link to={ROUTES.CATALOG} className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
            {t('cart.browseCatalog')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;