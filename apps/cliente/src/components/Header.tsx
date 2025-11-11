
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import CartIcon from './CartIcon';
import { useAuth } from '../hooks/useAuth';
import { auth } from 'shared/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '../hooks/useToast';
import { MenuIcon, UserCircleIcon, XIcon } from 'shared/components/ui/icons';

// Menu do Usuário para Desktop
const UserMenu: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            showToast(t('toast.logoutSuccess'), 'info');
            navigate(ROUTES.HOME);
        } catch (error) {
            showToast(t('toast.error'), 'error');
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // FIX: Cast event.target to Node to handle DOM node types correctly.
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        // FIX: Add guard for document to avoid errors in non-browser environments.
        if (typeof document !== 'undefined') {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, []);

    const displayName = user?.profile?.displayName || user?.email;
    const photoURL = user?.profile?.photoURL;

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
                <img 
                    src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=D4AF37&color=2C2C2C`} 
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                />
            </button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        <NavLink to={ROUTES.DASHBOARD} className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface" onClick={() => setIsOpen(false)}>{t('header.dashboard')}</NavLink>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface">{t('header.logout')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente principal do Cabeçalho
const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAuthOpen, setIsMobileAuthOpen] = useState(false);
  const mobileAuthRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    // FIX: Add guard for window to prevent errors in non-browser environments.
    if (typeof window !== 'undefined') {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // FIX: Cast event.target to Node to handle DOM node types correctly.
      if (mobileAuthRef.current && !mobileAuthRef.current.contains(event.target as Node)) {
        setIsMobileAuthOpen(false);
      }
    };
    // FIX: Add guard for document to avoid errors in non-browser environments.
    if (typeof document !== 'undefined') {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    showToast(t('toast.logoutSuccess'), 'info');
    setIsMobileAuthOpen(false);
    navigate(ROUTES.HOME);
  };
  
  const displayName = user?.profile?.displayName || user?.email;
  const photoURL = user?.profile?.photoURL;

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `relative py-2 text-sm font-medium transition-colors duration-300 ${
      isActive ? 'text-secondary' : 'text-text-primary hover:text-secondary'
    } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    }`;
  
  const mobileNavLinkClasses = `text-lg text-text-primary hover:text-secondary py-2`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={ROUTES.HOME} className="text-2xl font-heading font-bold text-primary">
              Melissa Pelussi
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink to={ROUTES.CATALOG} className={navLinkClasses}>{t('header.catalog')}</NavLink>
              <NavLink to={ROUTES.ABOUT} className={navLinkClasses}>{t('header.about')}</NavLink>
              <NavLink to={ROUTES.CONTACT} className={navLinkClasses}>{t('header.contact')}</NavLink>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-4">
              {/* Desktop Auth */}
              {!loading && (
                <div className="hidden md:flex items-center space-x-4">
                  {user ? (
                    <>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <UserMenu />
                    </>
                  ) : (
                    <>
                      <div className="w-px h-6 bg-gray-200"></div>
                      <Link to={ROUTES.LOGIN} className="text-sm font-medium text-text-secondary hover:text-primary">{t('header.login')}</Link>
                      <Link to={ROUTES.REGISTER} className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80">{t('header.register')}</Link>
                    </>
                  )}
                </div>
              )}
              <CartIcon />
              
              {/* Mobile Controls */}
              <div className="md:hidden flex items-center space-x-2">
                <div className="relative" ref={mobileAuthRef}>
                    <button onClick={() => setIsMobileAuthOpen(p => !p)}>
                        {user ? (
                             <img 
                                src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=D4AF37&color=2C2C2C`} 
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <UserCircleIcon className="w-7 h-7 text-text-secondary"/>
                        )}
                    </button>
                    {isMobileAuthOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                            {user ? (
                                <div className="py-1">
                                    <NavLink to={ROUTES.DASHBOARD} className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface" onClick={() => setIsMobileAuthOpen(false)}>{t('header.dashboard')}</NavLink>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface">{t('header.logout')}</button>
                                </div>
                            ) : (
                                <div className="py-1">
                                    <Link to={ROUTES.LOGIN} className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface" onClick={() => setIsMobileAuthOpen(false)}>{t('header.login')}</Link>
                                    <Link to={ROUTES.REGISTER} className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface" onClick={() => setIsMobileAuthOpen(false)}>{t('header.register')}</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu">
                  <MenuIcon className="w-7 h-7 text-text-secondary" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 p-4 flex flex-col">
          <div className="flex justify-between items-center">
             <Link to={ROUTES.HOME} className="text-xl font-heading font-bold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                Melissa Pelussi
            </Link>
            <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
              <XIcon className="w-7 h-7" />
            </button>
          </div>
          <nav className="mt-8 flex flex-col items-center justify-center flex-grow space-y-6">
            <NavLink to={ROUTES.CATALOG} className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.catalog')}</NavLink>
            <NavLink to={ROUTES.ABOUT} className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.about')}</NavLink>
            <NavLink to={ROUTES.CONTACT} className={mobileNavLinkClasses} onClick={() => setIsMobileMenuOpen(false)}>{t('header.contact')}</NavLink>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;