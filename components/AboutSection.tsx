import React from 'react';
import { SiteSettings } from '../types';

interface AboutSectionProps {
    settings: SiteSettings;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ settings }) => {
    // For the art gallery, we'll use a fixed structure for the About section
    // but pull the image from settings for customization.
    const aboutImageUrl = settings.contentSections?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1578956952998-84cf84aa2737?w=800';

    return (
        <section id="a-propos" className="py-20 bg-brand-surface">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                        <img src={aboutImageUrl} alt="L'artiste Andressa Pelussi" className="rounded-lg shadow-xl w-full h-auto object-cover" />
                    </div>
                    <div>
                         <span className="inline-block bg-brand-accent/10 text-brand-secondary px-4 py-2 rounded-full font-semibold text-sm mb-4">
                            <i className="fas fa-palette mr-2"></i>L'Artiste
                        </span>
                        <h2 className="text-4xl font-serif font-bold text-text-primary mb-6">Andressa Pelussi</h2>
                        <p className="text-text-secondary leading-relaxed mb-6">
                           Âgée de 25 ans, Andressa Pelussi est une artiste passionnée dont le travail explore la complexité des émotions humaines à travers des couleurs vibrantes et des textures audacieuses. Son parcours artistique est un voyage constant de découverte, cherchant à capturer l'éphémère et à le traduire en une expérience visuelle durable.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <i className="fas fa-paint-brush text-brand-secondary"></i>
                                <span className="text-text-primary">Exploration de techniques mixtes</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <i className="fas fa-globe-europe text-brand-secondary"></i>
                                <span className="text-text-primary">Basée au Luxembourg</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fab fa-instagram text-brand-secondary"></i>
                                <a href="https://instagram.com/meehpelussi" target="_blank" rel="noopener noreferrer" className="text-text-primary hover:text-brand-secondary transition-colors">
                                    @meehpelussi
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
