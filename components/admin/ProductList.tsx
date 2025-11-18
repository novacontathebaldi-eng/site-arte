import React, { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../../services/productService';
import { Product } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { SearchIcon, FilterIcon, ChevronDownIcon } from '../icons';

interface ProductListProps {
  onAddProduct: () => void;
  onEditProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ onAddProduct, onEditProduct }) => {
  const { language } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => statusFilter === 'all' || p.status === statusFilter)
      .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
      .filter(p => {
        if (!searchTerm) return true;
        const lowerSearch = searchTerm.toLowerCase();
        const title = (p.translations[language]?.title || p.translations.fr.title).toLowerCase();
        const sku = p.sku.toLowerCase();
        return title.includes(lowerSearch) || sku.includes(lowerSearch);
      });
  }, [products, searchTerm, statusFilter, categoryFilter, language]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif text-primary">All Products</h1>
        <button
          onClick={onAddProduct}
          className="bg-primary text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
        >
          Add New Product
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search by title or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="all">All Categories</option>
            <option value="paintings">Paintings</option>
            <option value="jewelry">Jewelry</option>
            <option value="digital">Digital Art</option>
            <option value="prints">Prints</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border rounded-md px-3 py-2">
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
            <option value="made-to-order">Made-to-order</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && <tr><td colSpan={7} className="text-center py-4">Loading products...</td></tr>}
              {error && <tr><td colSpan={7} className="text-center py-4 text-red-500">{error}</td></tr>}
              {!loading && filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={product.images[0]?.thumbnail} alt={product.images[0]?.alt} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.translations[language]?.title || product.translations.fr.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">{product.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">€{product.price.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.status === 'available' ? 'bg-green-100 text-green-800' :
                        product.status === 'sold' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {product.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => onEditProduct(product.id)} className="text-primary hover:text-primary/80">Edit</button>
                    <button className="text-red-600 hover:text-red-800 ml-4">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductList;