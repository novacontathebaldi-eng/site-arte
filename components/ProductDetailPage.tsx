import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import Spinner from './common/Spinner';
import Button from './common/Button';
import { useI18n } from '../hooks/useI18n';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { useToast } from '../hooks/useToast';
import NotFoundPage from './NotFoundPage';

interface ProductDetailPageProps {
    productId: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
    const [product, setProduct] = useState<ProductDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { t, language } = useI18n();
    const { addToCart } = useCart();
    const { addToWishlist, isInWishlist } = useWishlist();
    const { addToast } = useToast();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setError('Product not found.');
                setLoading(false);
                return;
            };
            setLoading(true);
            setProduct(null);
            setError(null);

            try {
                const docRef = doc(db, 'products', productId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() } as ProductDocument;
                    
                    if (!productData.price || !productData.images || !productData.category) {
                        console.error("Fetched product is missing essential data:", productData);
                        setError('Product data is incomplete.');
                        setProduct(null);
                    } else {
                        setProduct(productData);
                    }

                } else {
                    setError('Product not found.');
                    console.log("No such document!");
                }
            } catch (err) {
                console.error("Error fetching product details:", err);
                setError('Failed to load product.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
    }

    if (error || !product) {
        return <NotFoundPage />;
    }
    
    const handleAddToCart = () => {
        addToCart(product, 1);
        addToast(t('cart.added'), 'success');
    };

    const handleAddToWishlist = () => {
        addToWishlist(product);
        addToast(t('wishlist.added'), 'success');
    };

    const p = product.translations?.[language] || product.translations?.en;
    const inWishlist = isInWishlist(product.id);
    
    return (
        <div className="bg-brand-white dark:bg-brand-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    <div className="aspect-w-3 aspect-h-4 w-full overflow-hidden bg-black/5 rounded-md">
                        <img src={product.images?.[0]?.url || 'https://placehold.co/800x1000'} alt={p?.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-8 lg:mt-0">
                        <p className="text-sm uppercase tracking-widest text-brand-black/60 dark:text-brand-white/60">{t(`product.categories.${product.category}`)}</p>
                        <h1 className="text-3xl lg:text-4xl font-serif font-bold my-3">{p?.title}</h1>
                        <p className="text-3xl font-medium mb-6">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
                        
                        <div className="prose dark:prose-invert text-brand-black/80 dark:text-brand-white/80 max-w-none">
                            <p>{p?.description}</p>
                        </div>

                        <div className="mt-8 flex gap-4">
                            {product.status === 'available' ? (
                                <Button size="lg" className="flex-1" onClick={handleAddToCart}>{t('product.addToCart')}</Button>
                            ) : (
                                <Button size="lg" className="flex-1" disabled>{t(`product.statuses.${product.status}`)}</Button>
                            )}
                            <Button size="lg" variant="tertiary" onClick={handleAddToWishlist} disabled={inWishlist}>
                                {inWishlist ? t('wishlist.inWishlist') : t('product.addToWishlist')}
                            </Button>
                        </div>

                        <div className="mt-8 border-t dark:border-white/10 pt-6">
                            <h3 className="font-semibold mb-2">{t('product.specifications')}</h3>
                            <ul className="text-sm space-y-1 text-brand-black/70 dark:text-brand-white/70">
                                {product.dimensions && (product.dimensions.width > 0) && <li>{t('product.dimensions')}: {product.dimensions.width} x {product.dimensions.height} cm</li>}
                                {p?.materials && <li>{t('product.materials')}: {p.materials}</li>}
                                {product.yearCreated && <li>{t('product.year')}: {product.yearCreated}</li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetailPage;