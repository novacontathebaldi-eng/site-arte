import React from 'react';
import LanguageSelector from './LanguageSelector';
import { NAV_LINKS } from '../constants';
import { useI18n } from '../hooks/useI18n';
import InstagramIcon from './icons/InstagramIcon';
import FacebookIcon from './icons/FacebookIcon';
import { useSettings } from '../hooks/useSettings';
import ThemeSelector from './ThemeSelector';
import Reveal from './common/Reveal';

const Footer: React.FC = () => {
    const { t } = useI18n();
    const { settings } = useSettings();
    const year = new Date().getFullYear();
    
  return (
    <footer className="bg-brand-white dark:bg-brand-gray-900 border-t border-black/5 dark:border-white/5 text-brand-black/70 dark:text-brand-white/70 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand & Bio */}
          <Reveal animation="fade-in-up" delay="0ms">
             <div className="flex flex-col items-start">
                <a href="#" className="text-3xl font-serif font-bold text-brand-black dark:text-brand-white mb-4">Meeh</a>
                <p className="text-sm leading-relaxed mb-6 max-w-xs">
                   Showcasing unique art from Luxembourg. Paintings, jewelry, digital art, and prints created with passion and precision.
                </p>
                <div className="flex space-x-4">
                     <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="text-brand-black/60 dark:text-brand-white/60 hover:text-brand-gold transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                        <InstagramIcon className="w-5 h-5"/>
                     </a>
                     <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="text-brand-black/60 dark:text-brand-white/60 hover:text-brand-gold transition-colors p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                        <FacebookIcon className="w-5 h-5"/>
                     </a>
                 </div>
             </div>
          </Reveal>

          {/* Quick Links */}
          <Reveal animation="fade-in-up" delay="100ms">
            <div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-white tracking-widest uppercase mb-6">{t('footer.shop')}</h3>
                <ul className="space-y-3">
                {NAV_LINKS.map(link => (
                    <li key={link.href}>
                        <a href={link.href} className="text-sm hover:text-brand-gold transition-colors">{t(link.labelKey)}</a>
                    </li>
                ))}
                </ul>
            </div>
          </Reveal>

          {/* Info & Legal */}
          <Reveal animation="fade-in-up" delay="200ms">
            <div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-white tracking-widest uppercase mb-6">{t('footer.info')}</h3>
                <ul className="space-y-3">
                <li><a href="#" className="text-sm hover:text-brand-gold transition-colors">{t('footer.about')}</a></li>
                <li><a href="#" className="text-sm hover:text-brand-gold transition-colors">{t('footer.contact')}</a></li>
                <li><a href="#" className="text-sm hover:text-brand-gold transition-colors">{t('footer.terms')}</a></li>
                <li><a href="#" className="text-sm hover:text-brand-gold transition-colors">{t('footer.privacy')}</a></li>
                </ul>
            </div>
          </Reveal>

          {/* Settings & Contact */}
          <Reveal animation="fade-in-up" delay="300ms">
            <div>
                <h3 className="text-sm font-bold text-brand-black dark:text-brand-white tracking-widest uppercase mb-6">{t('footer.contactInfo')}</h3>
                <ul className="space-y-3 mb-6">
                     <li className="text-sm"><a href={`mailto:${settings?.contactEmail || 'hello@meeh.lu'}`} className="hover:text-brand-gold transition-colors">{settings?.contactEmail || 'hello@meeh.lu'}</a></li>
                     <li className="text-sm">Luxembourg</li>
                </ul>
                
                <div className="pt-6 border-t border-black/5 dark:border-white/5">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-wide font-semibold opacity-70">{t('footer.language')}</span>
                            <LanguageSelector />
                        </div>
                        <div className="flex items-center justify-between">
                             <span className="text-xs uppercase tracking-wide font-semibold opacity-70">Theme</span>
                             <ThemeSelector />
                        </div>
                    </div>
                </div>
            </div>
          </Reveal>
        </div>

        <div className="border-t border-black/10 dark:border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-brand-black/50 dark:text-brand-white/50">
          <p>&copy; {year} Melissa "Meeh" Pelussi. {t('footer.rights')}</p>
          <p className="mt-2 md:mt-0">Designed & Developed with ❤️</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;