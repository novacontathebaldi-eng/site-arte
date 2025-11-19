import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';

const AdminHeader: React.FC = () => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { path } = useRouter();

    const getPageTitle = () => {
        if (path.startsWith('/admin/products')) return 'Products';
        if (path.startsWith('/admin/orders')) return 'Orders';
        if (path.startsWith('/admin/customers')) return 'Customers';
        if (path.startsWith('/admin/settings')) return 'Settings';
        return 'Dashboard';
    }

    return (
        <header className="h-20 bg-brand-white border-b border-black/10 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
            <h1 className="text-xl font-bold font-serif">{getPageTitle()}</h1>
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
                    <div className="absolute right-0 mt-2 w-48 bg-brand-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                         <a href="#" className="block px-4 py-2 text-sm text-brand-black hover:bg-black/5">View Site</a>
                         <button
                            onClick={async () => {
                                await logout();
                                setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-brand-black hover:bg-black/5"
                            >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;
