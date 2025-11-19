import React from 'react';
import AuthGuard from './AuthGuard';
import AdminLayout from './AdminLayout';
import { useRouter } from '../../hooks/useRouter';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import SettingsPage from './pages/SettingsPage';
import ProductFormPage from './pages/ProductFormPage';
import OrderDetailAdminPage from './pages/OrderDetailAdminPage';
import CustomerDetailAdminPage from './pages/CustomerDetailAdminPage';
import DiscountCodesPage from './pages/DiscountCodesPage';

const AdminPanel: React.FC = () => {
    const { path } = useRouter();
    
    const renderPage = () => {
        // Product Routes
        if (path.startsWith('/admin/products/edit')) {
            const id = path.split('/').pop() || '';
            return <ProductFormPage id={id} />;
        }
        if (path === '/admin/products/new') {
            return <ProductFormPage />;
        }
        if (path.startsWith('/admin/products')) {
            return <ProductsPage />;
        }

        // Order Routes
        if (path.startsWith('/admin/orders/')) {
            const id = path.split('/').pop() || '';
            return <OrderDetailAdminPage orderId={id}/>;
        }
        if (path.startsWith('/admin/orders')) {
            return <OrdersPage />;
        }

        // Customer Routes
        if (path.startsWith('/admin/customers/')) {
            const id = path.split('/').pop() || '';
            return <CustomerDetailAdminPage userId={id} />;
        }
        if (path.startsWith('/admin/customers')) {
            return <CustomersPage />;
        }

        // Settings Routes
        if (path.startsWith('/admin/settings/discounts')) {
            return <DiscountCodesPage />;
        }
        if (path.startsWith('/admin/settings')) {
            return <SettingsPage />;
        }
        
        // Default to dashboard
        return <DashboardPage />;
    };

    return (
        <AuthGuard>
            <AdminLayout>
                {renderPage()}
            </AdminLayout>
        </AuthGuard>
    );
};

export default AdminPanel;
