import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { ROUTES } from '../../constants';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import {
  OverviewIcon,
  PackageIcon,
  UserIcon,
  LocationIcon,
  SettingsIcon,
  HeartIcon,
  LogoutIcon,
  XIcon,
} from '../../components/ui/icons';

// Este componente é o layout principal para toda a área do cliente.
const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isConfirmationBannerVisible, setIsConfirmationBannerVisible] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate(ROUTES.HOME);
  };
  
  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    try {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: user.email,
        });
        if (error) throw error;
        showToast(t('toast.confirmationSent'), 'success');
    } catch (error: any) {
        showToast(error.message || t('toast.error'), 'error');
    }
  };

  const navItems = [
    { to: ROUTES.DASHBOARD, label: t('dashboard.overview'), icon: OverviewIcon, end: true },
    { to: ROUTES.DASHBOARD_ORDERS, label: t('dashboard.orders'), icon: PackageIcon },
    { to: ROUTES.DASHBOARD_PROFILE, label: t('dashboard.profile'), icon: UserIcon },
    { to: ROUTES.DASHBOARD_ADDRESSES, label: t('dashboard.addresses'), icon: LocationIcon },
    { to: ROUTES.DASHBOARD_SETTINGS, label: t('dashboard.settings'), icon: SettingsIcon },
    { to: ROUTES.DASHBOARD_WISHLIST, label: t('dashboard.wishlist'), icon: HeartIcon },
  ];

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-secondary text-white'
        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
    }`;
  
  const displayName = user?.profile?.display_name || user?.email;
  // FIX: Property 'user_metadata' does not exist on type 'UserData'. Fallback to 'photoURL' from Firebase User.
  const photoURL = user?.profile?.photo_url || user?.photoURL;
  // FIX: Property 'email_confirmed_at' does not exist on type 'UserData'. Use 'emailVerified' from Firebase User.
  const isEmailConfirmed = !!user?.emailVerified;

  return (
    <div className="bg-surface min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Confirmação de E-mail */}
        {!isEmailConfirmed && isConfirmationBannerVisible && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md mb-6" role="alert">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-yellow-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
              </div>
              <div className="flex-grow">
                <p className="font-bold">{t('dashboard.confirmEmailBannerTitle')}</p>
                <p className="text-sm">{t('dashboard.confirmEmailBannerText')}</p>
                <button onClick={handleResendConfirmation} className="mt-2 text-sm font-semibold text-yellow-800 hover:underline">
                    {t('dashboard.resendConfirmation')}
                </button>
              </div>
              <button onClick={() => setIsConfirmationBannerVisible(false)} className="ml-auto flex-shrink-0 p-1.5">
                  <XIcon className="w-5 h-5"/>
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Menu Lateral (Sidebar) */}
          <aside className="lg:w-1/4 xl:w-1/5 flex-shrink-0">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center gap-4 mb-6 border-b pb-4">
                <img
                  src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=D4AF37&color=2C2C2C&bold=true`}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h2 className="font-bold text-lg text-text-primary truncate">{displayName}</h2>
                  <p className="text-sm text-text-secondary truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end} // `end` é importante para a rota principal do dashboard
                    className={navLinkClasses}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
                 <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-text-secondary hover:bg-surface hover:text-text-primary">
                    <LogoutIcon className="w-5 h-5 mr-3" />
                    <span>{t('dashboard.logout')}</span>
                 </button>
              </nav>
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="lg:w-3/4 xl:w-4/5">
            {/* O <Outlet> é onde as páginas aninhadas (Perfil, Pedidos, etc.) serão renderizadas */}
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;