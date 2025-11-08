import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LanguageContext } from '../context/LanguageContext';
import { CartContext } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { SupportedLanguage } from '../types';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext)!;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: SupportedLanguage; name: string; flag: string }[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
  ];

  const selectedLanguage = languages.find(l => l.code === language);

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
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2 text-text-primary hover:text-secondary transition-colors duration-300">
        <span>{selectedLanguage?.flag}</span>
        <span className="hidden md:inline">{selectedLanguage?.code.toUpperCase()}</span>
         <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 border border-border-color">
          <ul className="py-1">
            {languages.map(lang => (
              <li key={lang.code}>
                <button
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface flex items-center space-x-3"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const UserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return (
             <div className="flex items-center space-x-4 text-sm font-medium">
                <Link to="/login" className="text-text-primary hover:text-secondary transition-colors">{t('login')}</Link>
                <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors">{t('register')}</Link>
            </div>
        )
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
                <span className="text-sm font-medium">{t('welcome_back')} {user.displayName?.split(' ')[0] || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-border-color">
                    <ul className="py-1">
                        <li>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-text-primary hover:bg-surface">{t('dashboard')}</Link>
                        </li>
                        <li>
                            <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface">{t('logout')}</button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    )
}


const Header: React.FC = () => {
  const { t } = useTranslation();
  const { itemCount } = useContext(CartContext)!;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-full after:bg-secondary after:transition-transform after:duration-300 after:ease-in-out ${
      isActive ? 'text-secondary after:scale-x-100' : 'text-text-primary after:scale-x-0 hover:text-secondary hover:after:scale-x-100'
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="text-2xl font-serif font-bold text-primary">
            Meeh
          </NavLink>
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass}>{t('home')}</NavLink>
            <NavLink to="/catalog" className={navLinkClass}>{t('catalog')}</NavLink>
            <NavLink to="/about" className={navLinkClass}>{t('about')}</NavLink>
            <NavLink to="/contact" className={navLinkClass}>{t('contact')}</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <NavLink to="/cart" className="relative text-text-primary hover:text-secondary transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-secondary rounded-full">
                  {itemCount}
                </span>
              )}
            </NavLink>
            <div className="hidden md:block">
                 <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;