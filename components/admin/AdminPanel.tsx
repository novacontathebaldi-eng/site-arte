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

interface AdminPanelProps {
    route: string;
}

const AdminPanel: React.FC<AdminPanelProps> = () => {
    const { path, queryParams } = useRouter();
    
    const renderPage = () => {
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
        if (path.startsWith('/admin/orders')) {
            return <OrdersPage />;
        }
        if (path.startsWith('/admin/customers')) {
            return <CustomersPage />;
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
