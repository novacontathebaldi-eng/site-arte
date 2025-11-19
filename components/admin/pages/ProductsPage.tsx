
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductDocument } from '../../../firebase-types';
import Button from '../../common/Button';
import { useRouter } from '../../../hooks/useRouter';
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { navigate } = useRouter();
    const { addToast } = useToast();
    const { t } = useI18n();

    const fetchProducts = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
        setProducts(productsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
        setLoading(false);
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.products.deleteConfirm'))) {
            try {
                await deleteDoc(doc(db, "products", id));
                addToast(t('admin.products.deletedSuccess'), "success");
                fetchProducts(); // Refresh list
            } catch (error) {
                addToast(t('admin.products.deletedError'), "error");
                console.error("Error removing document: ", error);
            }
        }
    };

    const toggleField = async (product: ProductDocument, field: 'publishedAt' | 'featured') => {
        const docRef = doc(db, "products", product.id);
        let updateData: { [key: string]: any };
        let successMsg = '';

        if (field === 'publishedAt') {
            updateData = { publishedAt: product.publishedAt ? null : serverTimestamp() };
            successMsg = product.publishedAt ? 'Product unpublished' : 'Product published';
        } else {
            updateData = { featured: !product.featured };
            successMsg = product.featured ? 'Removed from featured' : 'Added to featured';
        }

        try {
            await updateDoc(docRef, updateData);
            setProducts(prev => 
                prev.map(p => 
                    p.id === product.id ? { ...p, ...updateData, publishedAt: updateData.publishedAt === null ? null : new Date() as any } : p
                )
            );
            addToast(successMsg, 'success');
        } catch (error) {
            addToast('Failed to update product', 'error');
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="bg-brand-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-serif">{t('admin.products.title')}</h2>
                <Button onClick={() => navigate('/admin/products/new')}>{t('admin.products.addNew')}</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/5">
                        <tr>
                            <th className="p-3">{t('admin.products.table.image')}</th>
                            <th className="p-3">{t('admin.products.table.name')}</th>
                            <th className="p-3">{t('admin.products.table.sku')}</th>
                            <th className="p-3">Featured</th>
                            <th className="p-3">{t('admin.products.table.published')}</th>
                            <th className="p-3 text-right">{t('admin.products.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-black/10 hover:bg-black/5 transition-colors">
                                <td className="p-3">
                                    <img src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || 'https://placehold.co/40'} alt={product.translations?.en?.title} className="w-10 h-10 object-cover rounded"/>
                                </td>
                                <td className="p-3 font-medium">{product.translations?.en?.title || 'No Title'}</td>
                                <td className="p-3">{product.sku}</td>
                                <td className="p-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={!!product.featured} onChange={() => toggleField(product, 'featured')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                                    </label>
                                </td>
                                <td className="p-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={!!product.publishedAt} onChange={() => toggleField(product, 'publishedAt')} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
                                    </label>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="tertiary" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>Edit</Button>
                                        <Button size="sm" variant="tertiary" className="text-red-600" onClick={() => handleDelete(product.id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsPage;
