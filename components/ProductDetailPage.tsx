import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument } from '../firebase-types';
import Spinner from './common/Spinner';
import ProductGrid from './ProductGrid';
import ImageGallery from './catalog/ImageGallery';
import Button from './common/Button';
import { useI18n } from '../hooks/useI18n';

interface ProductDetailPageProps {
    productId: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId }) => {
    const [product, setProduct] = useState<ProductDocument | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { t, language } = useI18n();

    useEffect(() => {
        const fetchProduct = async () => {
            if (!productId) {
                setLoading(false);
                return;
            };
            setLoading(true);
            setProduct(null);
            setRelatedProducts([]);

            try {
                const docRef = doc(db, 'products', productId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const productData = { id: docSnap.id, ...docSnap.data() } as ProductDocument;
                    setProduct(productData);

                    // Fetch related products
                    const relatedQuery = query(
                        collection(db, 'products'),
                        where('category', '==', productData.category),
                        where('__name__', '!=', productId), // Exclude the current product
                        limit(4)
                    );
                    const relatedSnapshot = await getDocs(relatedQuery);
                    const related = relatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
                    setRelatedProducts(related);

                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (loading) {
        return <div className="flex justify-center items-center h-96"><Spinner size="lg" /></div>;
    }

    if (!product) {
        return <div className="text-center py-20">Product not found.</div>;
    }
    
    const p = product.translations?.[language] || product.translations?.en;
    
    return (
        <div className="bg-brand-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12">
                    <ImageGallery images={product.images} />
                    <div className="mt-8 lg:mt-0">
                        <p className="text-sm uppercase tracking-widest text-brand-black/60">{t(`product.categories.${product.category}`)}</p>
                        <h1 className="text-3xl lg:text-4xl font-serif font-bold my-3">{p?.title}</h1>
                        <p className="text-3xl font-medium mb-6">€{((product.price?.amount || 0) / 100).toFixed(2)}</p>
                        
                        <div className="prose text-brand-black/80 max-w-none">
                            <p>{p?.description}</p>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button size="lg" className="flex-1">Add to Cart</Button>
                            <Button size="lg" variant="tertiary">Add to Wishlist</Button>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h3 className="font-semibold mb-2">Specifications</h3>
                            <ul className="text-sm space-y-1 text-brand-black/70">
                                {product.dimensions && (product.dimensions.width > 0) && <li>Dimensions: {product.dimensions.width} x {product.dimensions.height} cm</li>}
                                {p?.materials && <li>Materials: {p.materials}</li>}
                                {product.yearCreated && <li>Year: {product.yearCreated}</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <div className="mt-24">
                        <h2 className="text-2xl font-serif font-bold text-center mb-12">You Might Also Like</h2>
                         <ProductGrid products={relatedProducts} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductDetailPage;