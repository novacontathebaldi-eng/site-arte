import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../context/WishlistContext';
import { getProductsByIds } from '../../services/firestoreService';
import { Product } from '../../types';
import ProductCard from '../../components/ProductCard';
import Spinner from '../../components/Spinner';
import { useTranslation } from '../../hooks/useTranslation';

const DashboardWishlistPage: React.FC = () => {
    const { t } = useTranslation();
    const wishlistContext = useContext(WishlistContext);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            if (wishlistContext && wishlistContext.wishlist.length > 0) {
                setLoading(true);
                const fetchedProducts = await getProductsByIds(wishlistContext.wishlist);
                setProducts(fetchedProducts);
                setLoading(false);
            } else {
                setProducts([]);
                setLoading(false);
            }
        };

        if (!wishlistContext?.loading) {
            fetchProducts();
        }
    }, [wishlistContext]);

    if (loading || wishlistContext?.loading) return <Spinner />;

    return (
        <div>
            <h1 className="text-3xl font-serif mb-6">{t('my_wishlist')}</h1>
            {products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-text-secondary mb-4">{t('your_wishlist_is_empty')}</p>
                    <p className="text-text-secondary mb-8">{t('start_adding_items')}</p>
                    <Link to="/catalog" className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors">
                        {t('browse_catalog')}
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardWishlistPage;