import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
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
    
    const handleBulkDelete = async () => {
        const count = selectedProducts.length;
        if (count === 0) return;

        if (window.confirm(t('admin.products.bulkDeleteConfirm').replace('{{count}}', String(count)))) {
            try {
                const batch = writeBatch(db);
                selectedProducts.forEach(id => {
                    const docRef = doc(db, "products", id);
                    batch.delete(docRef);
                });
                await batch.commit();
                addToast(t('admin.products.bulkDeletedSuccess').replace('{{count}}', String(count)), "success");
                setSelectedProducts([]); // Clear selection
                fetchProducts(); // Refresh list
            } catch (error) {
                addToast(t('admin.products.bulkDeletedError'), "error");
                console.error("Error performing bulk delete: ", error);
            }
        }
    };

    const togglePublished = async (product: ProductDocument) => {
        const docRef = doc(db, "products", product.id);
        const newPublishedAt = product.publishedAt ? null : serverTimestamp();
        try {
            await updateDoc(docRef, { publishedAt: newPublishedAt });
            setProducts(prev => 
                prev.map(p => 
                    p.id === product.id ? { ...p, publishedAt: newPublishedAt ? new Date() as any : null } : p
                )
            );
            addToast(product.publishedAt ? 'Product unpublished' : 'Product published', 'success');
        } catch (error) {
            addToast('Failed to update status', 'error');
        }
    }
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedProducts(products.map(p => p.id));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSelectOne = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (e.target.checked) {
            setSelectedProducts(prev => [...prev, id]);
        } else {
            setSelectedProducts(prev => prev.filter(productId => productId !== id));
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-serif">{t('admin.products.title')}</h2>
                <Button onClick={() => navigate('/admin/products/new')}>{t('admin.products.addNew')}</Button>
            </div>
            
            {selectedProducts.length > 0 && (
                <div className="bg-blue-100 border border-blue-300 rounded-md p-3 mb-4 flex justify-between items-center">
                    <span className="text-blue-800 font-medium text-sm">
                        {t('admin.products.selectedCount').replace('{{count}}', String(selectedProducts.length))}
                    </span>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBulkDelete}>
                        {t('admin.products.deleteSelected')}
                    </Button>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                             <th className="p-3 w-4">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                                    onChange={handleSelectAll}
                                    checked={products.length > 0 && selectedProducts.length === products.length}
                                    indeterminate={selectedProducts.length > 0 && selectedProducts.length < products.length}
                                />
                            </th>
                            <th className="p-3">{t('admin.products.table.image')}</th>
                            <th className="p-3">{t('admin.products.table.name')}</th>
                            <th className="p-3">{t('admin.products.table.sku')}</th>
                            <th className="p-3">{t('admin.products.table.price')}</th>
                            <th className="p-3">{t('admin.products.table.stock')}</th>
                            <th className="p-3">{t('admin.products.table.published')}</th>
                            <th className="p-3 text-right">{t('admin.products.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-brand-gold focus:ring-brand-gold"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={(e) => handleSelectOne(e, product.id)}
                                    />
                                </td>
                                <td className="p-3">
                                    <img src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || 'https://placehold.co/40'} alt={product.translations?.en?.title} className="w-10 h-10 object-cover rounded"/>
                                </td>
                                <td className="p-3 font-medium">{product.translations?.en?.title || 'No Title'}</td>
                                <td className="p-3">{product.sku}</td>
                                <td className="p-3">€{((product.price?.amount || 0) / 100).toFixed(2)}</td>
                                <td className="p-3">{product.stock}</td>
                                <td className="p-3">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" checked={!!product.publishedAt} onChange={() => togglePublished(product)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-gold/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-gold"></div>
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
