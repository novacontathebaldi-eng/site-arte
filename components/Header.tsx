import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import firebase from 'firebase/compat/app';
import defaultProfilePic from '../assets/perfil.png';

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
    onOpenChatbot: () => void;
    activeSection: string;
    settings: SiteSettings;
    user: firebase.User | null;
    onUserIconClick: () => void;
    isAuthLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onOpenChatbot, activeSection, settings, user, onUserIconClick, isAuthLoading }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const scrollToSection = (id: string) => {
      const element = document.getElementById(id);
      if(element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    const navLinks = [
        { id: 'accueil', label: 'Accueil' },
        { id: 'a-propos', label: 'À propos' },
        { id: 'galerie', label: 'Galerie' },
        { id: 'contato', label: 'Contact' }
    ];

    return (
        <header className={`bg-brand-primary text-text-on-dark sticky top-0 z-50 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
            <div className="container mx-auto px-2 sm:px-4">
                <div className="flex justify-between items-center h-20 relative">
                    <a href="#accueil" onClick={(e) => { e.preventDefault(); scrollToSection('accueil');}} className="flex items-center gap-3 text-xl font-serif font-bold">
                        <img src={settings.logoUrl} alt="Logo" className="h-14" />
                        <span className="hidden sm:inline">Andressa Pelussi</span>
                    </a>
                    
                    <nav className="hidden lg:flex items-center gap-6">
                        {navLinks.map(link => (
                            <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id);}} className={`font-medium hover:text-brand-secondary transition-colors ${activeSection.toLowerCase() === link.label.toLowerCase() ? 'text-brand-secondary' : ''}`}>
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={onUserIconClick} className="relative w-12 h-12 flex items-center justify-center rounded-full bg-brand-olive-600 hover:bg-opacity-80 transition-colors" aria-label="Mon Compte" disabled={isAuthLoading}>
                            {isAuthLoading ? (
                                <i className="fas fa-spinner fa-spin text-2xl"></i>
                            ) : user ? (
                                <img src={user.photoURL || defaultProfilePic} alt="Photo de profil" className="w-full h-full rounded-full object-cover border-2 border-brand-secondary" />
                            ) : (
                                <i className="fas fa-user-circle text-2xl"></i>
                            )}
                        </button>
                        <button onClick={onCartClick} className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-brand-olive-600 hover:bg-opacity-80 transition-colors" aria-label="Ouvrir le panier">
                            <i className="fas fa-shopping-bag text-lg"></i>
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden w-12 h-12 flex items-center justify-center rounded-lg bg-brand-olive-600 hover:bg-opacity-80 transition-colors z-50">
                            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`lg:hidden fixed top-0 left-0 w-full h-full bg-brand-primary z-40 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                <nav className="flex flex-col items-center justify-center h-full gap-8 text-2xl pt-20">
                    {navLinks.map(link => (
                        <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); scrollToSection(link.id); handleLinkClick();}} className="font-bold hover:text-brand-secondary transition-colors">
                            {link.label}
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    );
};
