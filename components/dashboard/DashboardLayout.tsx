import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import Spinner from '../common/Spinner';
import DashboardHomePage from './pages/DashboardHomePage';
import OrdersListPage from './pages/OrdersListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import WishlistPage from './pages/WishlistPage';
import AddressesPage from './pages/AddressesPage';

const DashboardLayout: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { path, navigate } = useRouter();
    const { t } = useI18n();

    const navLinks = [
        { href: '/dashboard', labelKey: 'dashboard.nav.home' },
        { href: '/dashboard/orders', labelKey: 'dashboard.nav.orders' },
        { href: '/dashboard/wishlist', labelKey: 'dashboard.nav.wishlist' },
        { href: '/dashboard/addresses', labelKey: 'dashboard.nav.addresses' },
    ];

    if (!authLoading && !user) {
        navigate('/');
        return null; // or a login prompt
    }

    const renderPage = () => {
        if (path.startsWith('/dashboard/orders/')) {
            const id = path.split('/').pop() || '';
            return <OrderDetailPage orderId={id} />;
        }
        if (path === '/dashboard/orders') return <OrdersListPage />;
        if (path === '/dashboard/wishlist') return <WishlistPage />;
        if (path === '/dashboard/addresses') return <AddressesPage />;
        return <DashboardHomePage />;
    };
    
    const isActive = (href: string) => {
        return path === href || (href === '/dashboard/orders' && path.startsWith('/dashboard/orders/'));
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="lg:grid lg:grid-cols-4 lg:gap-8">
                    <aside className="lg:col-span-1">
                        <nav className="bg-white dark:bg-brand-black p-4 rounded-lg shadow-md">
                            <ul>
                                {navLinks.map(link => (
                                    <li key={link.href}>
                                        <a 
                                            href={`#${link.href}`}
                                            className={`block px-4 py-3 my-1 rounded-md text-sm font-medium transition-colors ${
                                                isActive(link.href)
                                                ? 'bg-brand-black text-brand-white dark:bg-brand-white dark:text-brand-black'
                                                : 'text-brand-black/70 dark:text-brand-white/70 hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                        >
                                            {t(link.labelKey)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </aside>
                    <div className="lg:col-span-3 mt-8 lg:mt-0">
                        <div className="bg-white dark:bg-brand-black p-8 rounded-lg shadow-md min-h-[400px]">
                            {authLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Spinner />
                                </div>
                            ) : (
                                renderPage()
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
