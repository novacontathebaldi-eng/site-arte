import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { ProductDocument } from '../../../firebase-types';
import Button from '../../common/Button';
import { useRouter } from '../../../hooks/useRouter';
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<ProductDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { navigate } = useRouter();
    const { addToast } = useToast();

    const fetchProducts = async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
        setProducts(productsData);
        setLoading(false);
    };
    
    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
                addToast("Product deleted successfully", "success");
                fetchProducts(); // Refresh list
            } catch (error) {
                addToast("Error deleting product", "error");
                console.error("Error removing document: ", error);
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="bg-brand-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-serif">Manage Products</h2>
                <Button onClick={() => navigate('/admin/products/new')}>Add New Product</Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-black/5">
                        <tr>
                            <th className="p-3">Image</th>
                            <th className="p-3">Name (EN)</th>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Stock</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} className="border-b border-black/10">
                                <td className="p-3">
                                    <img src={product.images?.[0]?.thumbnailUrl || product.images?.[0]?.url || 'https://placehold.co/40'} alt={product.translations?.en?.title} className="w-10 h-10 object-cover rounded"/>
                                </td>
                                <td className="p-3 font-medium">{product.translations?.en?.title || 'No Title'}</td>
                                <td className="p-3">{product.sku}</td>
                                <td className="p-3">€{(product.price.amount / 100).toFixed(2)}</td>
                                <td className="p-3">{product.stock}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${product.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
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
