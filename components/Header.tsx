import React, { useState, Fragment } from 'react';
import { NAV_LINKS } from '../constants';
import LanguageSelector from './LanguageSelector';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';

// Icons
const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const ShoppingBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { t } = useI18n();
  const { user, logout } = useAuth();

  const handleUserIconClick = () => {
    if (user) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <Fragment>
      <header className="sticky top-0 z-50 bg-stone-50/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="#" className="text-2xl font-serif font-bold text-stone-900">Meeh</a>
            </div>

            <nav className="hidden lg:flex lg:items-center lg:space-x-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
              <a href="#" className="text-stone-600 hover:text-stone-900"><HeartIcon className="h-6 w-6" /></a>
              <a href="#" className="text-stone-600 hover:text-stone-900"><ShoppingBagIcon className="h-6 w-6" /></a>
              <div className="relative">
                <button onClick={handleUserIconClick} className="text-stone-600 hover:text-stone-900">
                  <UserIcon className="h-6 w-6" />
                </button>
                {user && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-stone-700 border-b">
                      {t('header.signedInAs')}<br/>
                      <strong className="truncate">{user.displayName || user.email}</strong>
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100">{t('header.dashboard')}</a>
                    <button
                      onClick={async () => {
                        await logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"
                    >
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-stone-600 hover:text-stone-900"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-stone-50 border-t border-stone-200">
            <nav className="flex flex-col items-center space-y-4 p-4">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-base font-medium text-stone-600 hover:text-stone-900 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t(link.labelKey)}
                </a>
              ))}
              <div className="pt-4">
                <LanguageSelector />
              </div>
            </nav>
          </div>
        )}
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Fragment>
  );
};

export default Header;
