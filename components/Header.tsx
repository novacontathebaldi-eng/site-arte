import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '../constants';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './auth/AuthModal';
import { useCart } from '../hooks/useCart';
import SearchModal from './catalog/SearchModal';

// Icons
const HeartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);
const ShoppingBagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { t } = useI18n();
  const { user, userDoc, logout, loading: authLoading, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const { toggleCart, totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserIconClick = () => {
    if (user) {
      setIsUserMenuOpen(!isUserMenuOpen);
    } else {
      openAuthModal();
    }
  };
  
  const headerClasses = `fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
    isScrolled 
      ? 'bg-brand-white/90 dark:bg-brand-gray-900/90 backdrop-blur-md shadow-sm border-black/5 dark:border-white/5 h-16' 
      : 'bg-transparent border-transparent h-20'
  }`;
  
  const textClasses = isScrolled
    ? 'text-brand-black dark:text-brand-white'
    : 'text-brand-black dark:text-brand-white lg:text-brand-white dark:lg:text-brand-white lg:drop-shadow-md';

  const iconClasses = `p-2 rounded-full transition-all duration-200 ${
    isScrolled
      ? 'text-brand-black/70 dark:text-brand-white/70 hover:bg-black/5 dark:hover:bg-white/10 hover:text-brand-black dark:hover:text-brand-white'
      : 'text-brand-black/70 dark:text-brand-white/70 lg:text-white/90 lg:hover:text-white lg:hover:bg-white/10'
  }`;

  return (
    <Fragment>
      <header className={headerClasses}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            <div className="flex-shrink-0 z-50">
              <a 
                href="#/" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`text-2xl font-serif font-bold tracking-tight transition-colors duration-300 ${textClasses}`}
              >
                Meeh
              </a>
            </div>

            <nav className="hidden lg:flex lg:items-center lg:space-x-8">
              {NAV_LINKS.map((link) => (
                <a 
                    key={link.href} 
                    href={link.href} 
                    className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                        isScrolled
                        ? 'text-brand-black/70 dark:text-brand-white/70 hover:text-brand-black dark:hover:text-brand-white'
                        : 'text-white/80 hover:text-white drop-shadow-sm'
                    }`}
                >
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              {authLoading ? (
                 <div className="flex items-center space-x-2 animate-pulse">
                    <div className={`h-8 w-8 rounded-full bg-current opacity-20 ${textClasses}`}></div>
                    <div className={`h-8 w-8 rounded-full bg-current opacity-20 ${textClasses}`}></div>
                </div>
              ) : (
                <Fragment>
                  <button 
                    onClick={() => setIsSearchModalOpen(true)} 
                    className={iconClasses}
                    aria-label={t('header.search')}
                  >
                    <SearchIcon />
                  </button>
                  
                  <a 
                    href="#/dashboard/wishlist" 
                    className={iconClasses}
                    aria-label="Wishlist"
                  >
                    <HeartIcon />
                  </a>
                  
                  <button 
                    onClick={toggleCart} 
                    className={`relative ${iconClasses}`}
                    aria-label="Cart"
                  >
                    <ShoppingBagIcon />
                    {totalItems > 0 && (
                      <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-brand-black shadow-sm ring-2 ring-brand-white dark:ring-brand-gray-900">
                        {totalItems}
                      </span>
                    )}
                  </button>
                  
                  <div className="relative">
                    <button 
                        onClick={handleUserIconClick} 
                        className={iconClasses}
                        aria-label="User Menu"
                    >
                      <UserIcon />
                    </button>
                    <AnimatePresence>
                        {user && isUserMenuOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-56 bg-brand-white dark:bg-brand-gray-800 rounded-lg shadow-xl py-1 z-50 ring-1 ring-black dark:ring-brand-gray-700 ring-opacity-5 origin-top-right"
                        >
                            <div className="px-4 py-3 text-sm text-brand-black/80 dark:text-brand-white/80 border-b border-black/10 dark:border-white/10 mb-1">
                            <span className="block text-xs text-brand-black/50 dark:text-brand-white/50">{t('header.signedInAs')}</span>
                            <strong className="block truncate text-brand-black dark:text-brand-white font-semibold mt-0.5">{user.displayName || user.email}</strong>
                            </div>
                            <a href="#/dashboard" className="block px-4 py-2 text-sm text-brand-black dark:text-brand-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors">{t('header.dashboard')}</a>
                            {userDoc?.role === 'admin' && (
                                <a href="#/admin" className="block px-4 py-2 text-sm font-bold text-brand-gold hover:bg-black/5 dark:hover:bg-white/10 transition-colors">Admin Panel</a>
                            )}
                            <button
                            onClick={async () => {
                                await logout();
                                setIsUserMenuOpen(false);
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-brand-black dark:text-brand-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                            {t('header.logout')}
                            </button>
                        </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </Fragment>
              )}
               <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden ${iconClasses}`}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
            {isMenuOpen && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="lg:hidden bg-brand-white dark:bg-brand-gray-900 border-t border-black/10 dark:border-white/10 shadow-lg overflow-hidden"
            >
                <nav className="flex flex-col items-center space-y-6 p-8">
                {NAV_LINKS.map((link) => (
                    <a key={link.href} href={link.href} className="text-lg font-medium text-brand-black/80 dark:text-brand-white/80 hover:text-brand-gold dark:hover:text-brand-gold transition-colors" onClick={() => setIsMenuOpen(false)}>
                    {t(link.labelKey)}
                    </a>
                ))}
                </nav>
            </motion.div>
            )}
        </AnimatePresence>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </Fragment>
  );
};

export default Header;