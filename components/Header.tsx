import React from 'react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

interface HeaderProps {
  onNavigate: (view: 'home' | 'catalog') => void;
  onAuthClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onAuthClick }) => {
  const { user, logOut } = useAuth();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div 
            className="text-2xl font-serif font-bold text-primary cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            Melissa Pelussi
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => onNavigate('home')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">Home</button>
            <button onClick={() => onNavigate('catalog')} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">{t('footer.catalog')}</button>
          </nav>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {user ? (
               <div className="relative group">
                <button className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </button>
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">
                    <div className="px-4 py-3 border-b">
                        <p className="text-sm font-semibold truncate">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button onClick={logOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        {t('header.logout')}
                    </button>
                 </div>
               </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded-md hover:bg-primary hover:text-white transition-colors"
              >
                {t('header.login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;