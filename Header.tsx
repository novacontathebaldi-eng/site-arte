import React, { useState, Fragment } from 'react';
import { NAV_LINKS } from '../constants';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';
import { useCart } from '../hooks/useCart';

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
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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
  const { user, userDoc, logout } = useAuth();
  const { toggleCart, totalItems } = useCart();

  const handleUserIconClick = () => {
    if (user) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <Fragment>
      <header className="sticky top-0 z-50 bg-brand-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="#" className="text-2xl font-serif font-bold text-brand-black">Meeh</a>
            </div>

            <nav className="hidden lg:flex lg:items-center lg:space-x-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-brand-black/70 hover:text-brand-black transition-colors">
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
               <button className="text-brand-black/70 hover:text-brand-black"><SearchIcon className="h-6 w-6" /></button>
              <a href="#/dashboard/wishlist" className="text-brand-black/70 hover:text-brand-black"><HeartIcon className="h-6 w-6" /></a>
              <button onClick={toggleCart} className="relative text-brand-black/70 hover:text-brand-black">
                <ShoppingBagIcon className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-xs font-bold text-brand-black">{totalItems}</span>
                )}
              </button>
              <div className="relative">
                <button onClick={handleUserIconClick} className="text-brand-black/70 hover:text-brand-black">
                  <UserIcon className="h-6 w-6" />
                </button>
                {user && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-brand-black/80 border-b">
                      {t('header.signedInAs')}<br/>
                      <strong className="truncate text-brand-black">{user.displayName || user.email}</strong>
                    </div>
                    <a href="#/dashboard" className="block px-4 py-2 text-sm text-brand-black hover:bg-black/5">{t('header.dashboard')}</a>
                     {userDoc?.role === 'admin' && (
                        <a href="#/admin" className="block px-4 py-2 text-sm font-bold text-brand-gold hover:bg-black/5">Admin Panel</a>
                    )}
                    <button
                      onClick={async () => {
                        await logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm text-brand-black hover:bg-black/5"
                    >
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden text-brand-black/70 hover:text-brand-black"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-brand-white border-t border-black/10">
            <nav className="flex flex-col items-center space-y-4 p-4">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="text-base font-medium text-brand-black/70 hover:text-brand-black transition-colors" onClick={() => setIsMenuOpen(false)}>
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </Fragment>
  );
};

export default Header;