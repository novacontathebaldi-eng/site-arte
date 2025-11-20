import React from 'react';
import { LANGUAGES } from '../constants';
import { useI18n } from '../hooks/useI18n';

// SVG Flag components
const FrFlagIcon = () => <svg width="24" height="24" viewBox="0 0 3 2"><path fill="#fff" d="M0 0h3v2H0z"/><path fill="#002654" d="M0 0h1v2H0z"/><path fill="#CE1126" d="M2 0h1v2H2z"/></svg>;
const EnFlagIcon = () => <svg width="24" height="24" viewBox="0 0 60 30"><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30m0-30L0 30" clipPath="url(#a)" stroke="#C8102E" strokeWidth="4"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></svg>;
const DeFlagIcon = () => <svg width="24" height="24" viewBox="0 0 5 3"><path d="M0 0h5v3H0z"/><path fill="#D00" d="M0 1h5v1H0z"/><path fill="#FFCE00" d="M0 2h5v1H0z"/></svg>;
const PtFlagIcon = () => <svg width="24" height="24" viewBox="0 0 300 200"><path fill="#006241" d="M0 0h120v200H0z"/><path fill="#D21034" d="M120 0h180v200H120z"/><g transform="translate(120 100) scale(3.5)"><circle fill="#fff" r="20"/><path id="b" fill="none" stroke="#DAA520" strokeWidth="2.5" d="M-15 0a15 15 0 0130 0 15 15 0 01-30 0"/><circle fill="#006241" r="12"/><g id="c" fill="#fff"><path d="M-6 0h12v-3a6 6 0 00-12 0z"/><path d="M-6 0h12v3a6 6 0 01-12 0z"/></g><use href="#c" transform="rotate(45)"/><use href="#c" transform="rotate(90)"/><use href="#c" transform="rotate(135)"/><use href="#c" transform="rotate(180)"/><use href="#c" transform="rotate(225)"/><use href="#c" transform="rotate(270)"/><use href="#c" transform="rotate(315)"/><circle fill="#D21034" r="7"/><g fill="#DAA520"><use href="#b" transform="scale(.8)"/><circle r="2.5"/></g></g></svg>;

const flagMap = {
  fr: <FrFlagIcon />,
  en: <EnFlagIcon />,
  de: <DeFlagIcon />,
  pt: <PtFlagIcon />,
};

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center space-x-1 p-1 bg-black/5 dark:bg-white/10 rounded-md">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`flex items-center justify-center w-9 h-8 text-xs font-semibold rounded-md transition-colors
            ${language === lang.code
              ? 'bg-brand-white dark:bg-gray-700 ring-1 ring-black/10 dark:ring-white/10 shadow-sm'
              : 'hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          aria-label={`Switch to ${lang.name}`}
        >
          <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full">
            {flagMap[lang.code]}
          </div>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
