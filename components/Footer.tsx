import React from 'react';
import LanguageSelector from './LanguageSelector';
import { NAV_LINKS } from '../constants';
import { useI18n } from '../hooks/useI18n';

const Footer: React.FC = () => {
    const { t } = useI18n();
    
  return (
    <footer className="bg-stone-100 text-stone-600 border-t border-stone-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-stone-800 tracking-wider uppercase">{t('footer.shop')}</h3>
            <ul className="mt-4 space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.href}><a href={link.href} className="hover:text-stone-900">{t(link.labelKey)}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 tracking-wider uppercase">{t('footer.info')}</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#" className="hover:text-stone-900">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-stone-900">{t('footer.contact')}</a></li>
              <li><a href="#" className="hover:text-stone-900">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-stone-900">{t('footer.privacy')}</a></li>
            </ul>
          </div>
          <div>
             <h3 className="font-semibold text-stone-800 tracking-wider uppercase">{t('footer.follow')}</h3>
             <div className="mt-4 flex space-x-4">
                 {/* Replace with actual social links */}
                 <a href="#" className="hover:text-stone-900">Instagram</a>
                 <a href="#" className="hover:text-stone-900">Facebook</a>
             </div>
          </div>
          <div>
            <h3 className="font-semibold text-stone-800 tracking-wider uppercase">{t('footer.language')}</h3>
            <div className="mt-4">
                <LanguageSelector isFooter={true} />
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm">
          {/* FIX: Corrected the function call to get the current year. */}
          <p>&copy; {new Date().getFullYear()} Melissa "Meeh" Pelussi. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;