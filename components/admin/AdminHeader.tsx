import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';
import { useI18n } from '../../hooks/useI18n';
import LanguageSelector from '../LanguageSelector';

const AdminHeader: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { path } = useRouter();
    const { t } = useI18n();

    const getPageTitle = () => {
        if (path.startsWith('/admin/products/new')) return t('admin.productForm.createTitle');
        if (path.startsWith('/admin/products/edit')) return t('admin.productForm.editTitle');
        if (path.startsWith('/admin/products')) return t('admin.sidebar.products');
        if (path.startsWith('/admin/orders')) return t('admin.sidebar.orders');
        if (path.startsWith('/admin/customers')) return t('admin.sidebar.customers');
        if (path.startsWith('/admin/settings')) return t('admin.sidebar.settings');
        return t('admin.sidebar.dashboard');
    }

    return (
        <header className="h-20 bg-brand-white dark:bg-brand-gray-800 border-b border-black/10 dark:border-brand-gray-700 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
            <h1 className="text-xl font-bold font-serif">{getPageTitle()}</h1>
            <div className="flex items-center gap-4">
                <LanguageSelector />
                <div className="relative">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2"
                    >
                        <img 
                            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=D4AF37&color=2C2C2C`}
                            alt="Admin avatar"
                            className="h-9 w-9 rounded-full"
                        />
                         <span className="hidden sm:inline text-sm font-medium">{user?.displayName || user?.email}</span>
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-brand-white dark:bg-brand-gray-700 rounded-md shadow-lg py-1 z-50 ring-1 ring-black dark:ring-brand-gray-700 ring-opacity-5">
                             <a href="#" className="block px-4 py-2 text-sm text-brand-black dark:text-brand-white hover:bg-black/5 dark:hover:bg-white/10">{t('admin.header.viewSite')}</a>
                             <button
                                onClick={async () => {
                                    await logout();
                                    setIsUserMenuOpen(false);
                                }}
                                className="w-full text-left block px-4 py-2 text-sm text-brand-black dark:text-brand-white hover:bg-black/5 dark:hover:bg-white/10"
                                >
                                {t('admin.header.logout')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;