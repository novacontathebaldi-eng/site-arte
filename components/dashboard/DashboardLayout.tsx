import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout } = useAuth();

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `block py-2.5 px-4 rounded transition duration-200 ${
        isActive ? 'bg-secondary text-primary' : 'hover:bg-surface'
        }`;
    
    const navItems = [
        { to: '/dashboard', label: t('overview'), end: true },
        { to: '/dashboard/orders', label: t('my_orders') },
        { to: '/dashboard/addresses', label: t('my_addresses') },
        { to: '/dashboard/wishlist', label: t('my_wishlist') },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <nav className="sticky top-24 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <ul className="space-y-1">
                            {navItems.map(item => (
                                <li key={item.to}>
                                    <NavLink to={item.to} end={item.end} className={navLinkClass}>
                                        {item.label}
                                    </NavLink>
                                </li>
                            ))}
                             <li>
                                <button onClick={logout} className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-surface">
                                    {t('logout')}
                                </button>
                            </li>
                        </ul>
                    </nav>
                </aside>
                <main className="w-full md:w-3/4 lg:w-4/5">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;