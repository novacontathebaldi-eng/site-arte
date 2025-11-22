import React from 'react';
import LanguageSelector from './LanguageSelector';
import { NAV_LINKS } from '../constants';
import { useI18n } from '../hooks/useI18n';
import InstagramIcon from './icons/InstagramIcon';
import FacebookIcon from './icons/FacebookIcon';
import { useSettings } from '../hooks/useSettings';
import ThemeSelector from './ThemeSelector';

const Footer: React.FC = () => {
    const { t } = useI18n();
    const { settings } = useSettings();
    
  return (
    <footer className="bg-black/5 dark:bg-white/5 text-brand-black/70 dark:text-brand-white/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
             <a href="#" className="text-2xl font-serif font-bold text-brand-black dark:text-brand-white">Meeh</a>
          </div>
          <div>
            <h3 className="font-semibold text-brand-black dark:text-brand-white tracking-wider uppercase">{t('footer.shop')}</h3>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.href}><a href={link.href} className="hover:text-brand-gold">{t(link.labelKey)}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-brand-black dark:text-brand-white tracking-wider uppercase">{t('footer.info')}</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-brand-gold">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-brand-gold">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-brand-gold">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-brand-gold">{t('footer.privacy')}</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
             <h3 className="font-semibold text-brand-black dark:text-brand-white tracking-wider uppercase">{t('footer.contactInfo')}</h3>
             <ul className="mt-4 space-y-2">
                 <li><a href={`mailto:${settings?.contactEmail || 'hello@meeh.lu'}`} className="hover:text-brand-gold">{settings?.contactEmail || 'hello@meeh.lu'}</a></li>
                 <li>Luxembourg</li>
             </ul>
             <div className="mt-4 flex space-x-4">
                 <a href={settings?.socialLinks?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold"><InstagramIcon className="w-6 h-6"/></a>
                 <a href={settings?.socialLinks?.facebook || '#'} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold"><FacebookIcon className="w-6 h-6"/></a>
             </div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-brand-black dark:text-brand-white tracking-wider uppercase">{t('footer.language')}</h3>
            <div className="mt-4">
                <LanguageSelector />
            </div>
            <div className="mt-4">
                <ThemeSelector />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-black/10 dark:border-white/10 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Melissa "Meeh" Pelussi. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
