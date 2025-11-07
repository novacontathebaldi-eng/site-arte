import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import { supabase } from '../../lib/supabase';
import { ChartBarIcon, BoxIcon, UsersIcon, LogoutIcon } from '../../components/ui/icons';

const AdminLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ROUTES.HOME);
  };
  
  const navItems = [
    { to: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: ChartBarIcon, end: true },
    { to: ROUTES.ADMIN_PRODUCTS, label: 'Products', icon: BoxIcon },
    { to: ROUTES.ADMIN_ORDERS, label: 'Orders', icon: UsersIcon },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-secondary text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  const displayName = user?.profile?.display_name || user?.email;
  const photoURL = user?.profile?.photo_url || user?.user_metadata?.avatar_url;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-primary text-white flex flex-col">
        <div className="h-20 flex items-center justify-center text-2xl font-heading font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClasses}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
           <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white">
                <LogoutIcon className="w-5 h-5 mr-3" />
                <span>Logout</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-20 flex items-center justify-end px-8">
            <div className="flex items-center gap-4">
                 <div className="text-right">
                  <h3 className="font-semibold text-sm">{displayName}</h3>
                  <p className="text-xs text-text-secondary">Administrator</p>
                </div>
                <img
                    src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=D4AF37&color=2C2C2C&bold=true`}
                    alt="Admin Avatar"
                    className="w-10 h-10 rounded-full"
                />
            </div>
        </header>
        <main className="flex-grow p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;