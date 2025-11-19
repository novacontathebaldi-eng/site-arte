

import React from 'react';
import { useRouter } from '../../hooks/useRouter';
import { useI18n } from '../../hooks/useI18n';

const iconClasses = "h-5 w-5 mr-3";

// Placeholder Icons
const DashboardIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ProductIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const OrderIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg>;
const CustomerIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>;
const SettingsIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>;
// FIX: Replaced the SVG path for DiscountIcon to prevent potential rendering errors.
const DiscountIcon: React.FC = () => <svg className={iconClasses} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>;


const Sidebar: React.FC = () => {
    const { path } = useRouter();
    const { t } = useI18n();
    
    const navLinks = [
        { href: '/admin/dashboard', labelKey: 'admin.sidebar.dashboard', icon: <DashboardIcon /> },
        { href: '/admin/products', labelKey: 'admin.sidebar.products', icon: <ProductIcon /> },
        { href: '/admin/orders', labelKey: 'admin.sidebar.orders', icon: <OrderIcon /> },
        { href: '/admin/customers', labelKey: 'admin.sidebar.customers', icon: <CustomerIcon /> },
        { href: '/admin/settings', labelKey: 'admin.sidebar.settings', icon: <SettingsIcon />,
          subLinks: [
              { href: '/admin/settings/discounts', labelKey: 'admin.sidebar.discounts', icon: <DiscountIcon />}
          ]
        },
    ];

    const isActive = (href: string) => {
        if (href === '/admin/dashboard' && (path === '/admin' || path === '/admin/dashboard')) return true;
        if (href === '/admin/settings' && path.startsWith('/admin/settings')) return true;
        return path.startsWith(href) && href !== '/admin/dashboard' && href !== '/admin/settings';
    };

    return (
        <aside className="w-64 bg-brand-white shadow-md flex-shrink-0 hidden lg:block">
            <div className="h-20 flex items-center justify-center border-b border-black/10">
                <a href="#" className="text-2xl font-serif font-bold text-brand-black">Meeh</a>
            </div>
            <nav className="p-4">
                <ul>
                    {navLinks.map(link => (
                        <li key={link.href}>
                            <a 
                                href={`#${link.href}`}
                                className={`flex items-center px-4 py-3 my-1 rounded-md text-sm font-medium transition-colors ${
                                    isActive(link.href)
                                    ? 'bg-brand-black text-brand-white'
                                    : 'text-brand-black/70 hover:bg-black/5'
                                }`}
                            >
                                {link.icon}
                                {t(link.labelKey)}
                            </a>
                             {link.subLinks && isActive(link.href) && (
                                <ul className="pl-8 mt-1">
                                    {link.subLinks.map(subLink => (
                                         <li key={subLink.href}>
                                             <a
                                                href={`#${subLink.href}`}
                                                className={`flex items-center px-4 py-2 my-1 rounded-md text-xs font-medium transition-colors ${
                                                    path.startsWith(subLink.href)
                                                    ? 'text-brand-black font-semibold'
                                                    : 'text-brand-black/60 hover:text-brand-black'
                                                }`}
                                             >
                                                {t(subLink.labelKey)}
                                             </a>
                                         </li>
                                    ))}
                                </ul>
                             )}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;