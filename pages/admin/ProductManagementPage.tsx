import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { getProducts, deleteProduct } from '../../services/api';
import { AdminTableSkeleton } from '../../components/SkeletonLoader';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/icons';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../constants';
import { useToast } from '../../hooks/useToast';

const statusVariantMapping = {
    available: 'success',
    sold: 'error',
    'made-to-order': 'warning',
};

const ProductManagementPage: React.FC = () => {
    const { t, language } = useTranslation();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const fetchedProducts = await getProducts();
            setProducts(fetchedProducts);
        } catch (error: any) {
            console.error("Failed to fetch products for admin panel:", error.message);
            showToast(t('toast.error'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    const handleAddProduct = () => {
        navigate(ROUTES.ADMIN_PRODUCTS_NEW);
    };

    const handleEditProduct = (id: string) => {
        navigate(ROUTES.ADMIN_PRODUCTS_EDIT.replace(':productId', id));
    };

    const handleDeleteProduct = async (id: string, images: { url: string }[]) => {
        if (window.confirm(t('admin.deleteConfirm'))) {
            try {
                await deleteProduct(id, images.map(img => img.url));
                showToast(t('toast.productDeleted'), 'success');
                fetchProducts(); // Refresh the list
            } catch (error: any) {
                console.error("Failed to delete product:", error.message);
                showToast(t('toast.error'), 'error');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-primary">{t('admin.productManagement')}</h1>
                <Button onClick={handleAddProduct} className="w-auto flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {t('admin.addNewProduct')}
                </Button>
            </div>

            {isLoading ? (
                <AdminTableSkeleton />
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Tabela para Desktop */}
                    <div className="hidden md:block">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4"><img src={product.images[0]?.url} alt={product.images[0]?.alt} className="w-12 h-12 object-cover rounded-md" /></td>
                                        <td className="px-6 py-4 font-medium">{product.translations[language]?.title}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(product.price.amount)}</td>
                                        <td className="px-6 py-4">{product.stock}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={statusVariantMapping[product.status] as any}>{t(`product.${product.status}`)}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleEditProduct(product.id)} className="text-secondary hover:text-secondary/80 p-2"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDeleteProduct(product.id, product.images)} className="text-red-500 hover:text-red-700 p-2 ml-2"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Cards para Mobile */}
                    <div className="md:hidden space-y-4 p-4">
                         {products.map(product => (
                            <div key={product.id} className="bg-gray-50 p-4 rounded-lg shadow">
                                <div className="flex gap-4">
                                    <img src={product.images[0]?.url} alt={product.images[0]?.alt} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />
                                    <div className="flex-grow">
                                        <p className="font-bold">{product.translations[language]?.title}</p>
                                        <p className="text-sm text-gray-600">{product.sku}</p>
                                        <p className="text-sm font-semibold mt-1">{formatCurrency(product.price.amount)}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-4 border-t pt-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Badge variant={statusVariantMapping[product.status] as any}>{t(`product.${product.status}`)}</Badge>
                                        <span>Stock: {product.stock}</span>
                                    </div>
                                    <div>
                                        <button onClick={() => handleEditProduct(product.id)} className="text-secondary hover:text-secondary/80 p-2"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteProduct(product.id, product.images)} className="text-red-500 hover:text-red-700 p-2 ml-1"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            </div>
                         ))}
                    </div>

                    {/* Paginação */}
                    <div className="px-6 py-4 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-600">Showing 1 to {products.length} of {products.length} results</span>
                        <div className="flex gap-2">
                            <Button variant="secondary" className="w-auto px-3 py-1 text-sm">Previous</Button>
                            <Button variant="secondary" className="w-auto px-3 py-1 text-sm">Next</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagementPage;