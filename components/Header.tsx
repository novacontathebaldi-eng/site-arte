import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSwitcher from './LanguageSwitcher';
import { ROUTES } from '../constants';
import CartIcon from './CartIcon';
import { useAuth } from '../hooks/useAuth';
import { auth } from '../lib/firebase';
import { useToast } from '../hooks/useToast';

// Componente para o menu do usuário quando ele está logado.
const UserMenu: React.FC = () => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = auth.currentUser;

    const handleLogout = async () => {
        await auth.signOut();
        showToast(t('toast.logoutSuccess'), 'info');
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
                <img 
                    src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=D4AF37&color=2C2C2C`} 
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full"
                />
            </button>
            {isOpen && (
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        <NavLink to={ROUTES.DASHBOARD} className="block px-4 py-2 text-sm text-text-secondary hover:bg-surface">{t('header.dashboard')}</NavLink>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface">{t('header.logout')}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente principal do Cabeçalho.
const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = ({ isActive }: { isActive: boolean }): string =>
    `relative py-2 text-sm font-medium transition-colors duration-300 ${
      isActive ? 'text-secondary' : 'text-text-primary hover:text-secondary'
    } after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-secondary after:transition-all after:duration-300 ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to={ROUTES.HOME} className="text-2xl font-heading font-bold text-primary">
            Melissa Pelussi
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to={ROUTES.CATALOG} className={navLinkClasses}>
              {t('header.catalog')}
            </NavLink>
            <NavLink to={ROUTES.ABOUT} className={navLinkClasses}>
              {t('header.about')}
            </NavLink>
            <NavLink to={ROUTES.CONTACT} className={navLinkClasses}>
              {t('header.contact')}
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <CartIcon />
            <div className="w-px h-6 bg-gray-200"></div>
            
            {/* Lógica de Autenticação: Mostra o menu do usuário ou os botões de login */}
            {!loading && (
              user ? (
                <UserMenu />
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                    <Link to={ROUTES.LOGIN} className="text-sm font-medium text-text-secondary hover:text-primary">{t('header.login')}</Link>
                    <Link to={ROUTES.REGISTER} className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-80">{t('header.register')}</Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;