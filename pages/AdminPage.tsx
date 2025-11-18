import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../components/admin/Dashboard';
import ProductList from '../components/admin/ProductList';
// Import other admin components as they are created
// import OrderList from '../components/admin/OrderList';
// import CustomerList from '../components/admin/CustomerList';

export type AdminView = 
  'dashboard' | 
  'productList' | 
  'productNew' | 
  'productEdit' |
  'orders' |
  'customers' |
  'content' |
  'settings' |
  'analytics';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const navigateTo = (view: AdminView, productId?: string) => {
    setCurrentView(view);
    if (productId) {
      setEditingProductId(productId);
    } else {
      setEditingProductId(null);
    }
  };

  // This is a redundant check as App.tsx already protects this route, but it's good practice.
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-serif text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'productList':
        return <ProductList onEditProduct={(id) => navigateTo('productEdit', id)} onAddProduct={() => navigateTo('productNew')} />;
      // case 'productNew':
      //   return <ProductForm onCancel={() => navigateTo('productList')} />;
      // case 'productEdit':
      //   return <ProductForm productId={editingProductId} onCancel={() => navigateTo('productList')} />;
      // Add cases for other views as components are created
      case 'orders':
        return <div>Orders Page (Not Implemented)</div>;
       case 'customers':
        return <div>Customers Page (Not Implemented)</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {renderContent()}
    </div>
  );
};

export default AdminPage;