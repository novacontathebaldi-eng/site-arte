import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

// Componente do Ícone do Instagram
const InstagramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" {...props}>
    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7-74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.3 26.2 58 34.4 93.9 36.2 37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
  </svg>
);

// Este é o componente do Rodapé (Footer).
const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-surface text-text-secondary border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Coluna 1: Sobre a Artista */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-heading font-semibold text-text-primary">Melissa Pelussi</h3>
            <p className="mt-4 text-sm leading-relaxed">
              {t('home.artistIntro')}
            </p>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">{t('footer.quickLinks')}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to={ROUTES.HOME} className="hover:text-secondary transition-colors">Home</Link></li>
              <li><Link to={ROUTES.CATALOG} className="hover:text-secondary transition-colors">{t('header.catalog')}</Link></li>
              <li><Link to={ROUTES.ABOUT} className="hover:text-secondary transition-colors">{t('header.about')}</Link></li>
              <li><Link to={ROUTES.CONTACT} className="hover:text-secondary transition-colors">{t('header.contact')}</Link></li>
            </ul>
          </div>

          {/* Coluna 3: Redes Sociais */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">{t('footer.socialMedia')}</h3>
            <div className="mt-4 flex space-x-4">
              <a href="https://instagram.com/meehpelussi" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                 className="text-text-secondary hover:text-secondary transition-colors text-2xl">
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Coluna 4: Idioma */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-text-primary">{t('footer.language')}</h3>
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;