import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';

interface HeroSectionProps {
    settings: SiteSettings;
    isLoading: boolean;
    onReserveClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, isLoading, onReserveClick }) => {
    const [scrollOpacity, setScrollOpacity] = useState(1);

    useEffect(() => {
        const handleScroll = () => {
            const fadeStart = 50;
            const fadeEnd = 400;
            const scrollPosition = window.scrollY;

            if (scrollPosition <= fadeStart) {
                setScrollOpacity(1);
            } else if (scrollPosition >= fadeEnd) {
                setScrollOpacity(0);
            } else {
                const newOpacity = 1 - ((scrollPosition - fadeStart) / (fadeEnd - fadeStart));
                setScrollOpacity(newOpacity);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToGallery = () => {
        const gallerySection = document.getElementById('galerie');
        if (gallerySection) {
            const headerOffset = 80;
            const elementPosition = gallerySection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
        }
    };

    const heroTitle = settings.heroTitle ?? '';
    const heroSlogan = settings.heroSlogan ?? '';
    const heroSubtitle = settings.heroSubtitle ?? '';

    return (
        <section id="accueil" className="bg-brand-primary text-text-on-dark min-h-[calc(100vh-80px)] flex items-center justify-center pb-20 px-4 relative overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center" 
                style={{
                    backgroundImage: `url(${settings.heroBgUrl})`,
                    opacity: scrollOpacity,
                    transition: 'opacity 0.1s ease-out'
                }}
            ></div>
            <div 
                className="absolute inset-0 bg-black/60"
                style={{
                    opacity: scrollOpacity,
                    transition: 'opacity 0.1s ease-out'
                }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-primary via-brand-primary/80 to-transparent"></div>
            
            <div className="container mx-auto text-center z-10">
                <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">
                    <p className="font-semibold text-sm flex items-center gap-2"><i className="fas fa-palette text-brand-accent"></i> {heroSlogan}</p>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-extrabold mb-4 leading-tight">
                   {heroTitle}
                </h1>
                <p className="text-lg md:text-xl font-medium text-brand-background/90 mb-8 max-w-2xl mx-auto">
                    {heroSubtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={scrollToGallery} 
                        disabled={isLoading}
                        className="bg-brand-secondary text-white font-bold py-3 px-8 rounded-lg text-lg hover:opacity-90 transition-all transform hover:scale-105 disabled:bg-opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[280px]"
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                <span>Chargement...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-image mr-2"></i>
                                <span>Voir la Galerie</span>
                            </>
                        )}
                    </button>
                    <button 
                        onClick={onReserveClick} 
                        className="bg-transparent border-2 border-brand-secondary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-brand-secondary transition-all transform hover:scale-105 flex items-center justify-center min-w-[280px]"
                    >
                        <i className="fas fa-calendar-alt mr-2"></i>
                        <span>Prendre rendez-vous</span>
                    </button>
                </div>
            </div>
        </section>
    );
};
