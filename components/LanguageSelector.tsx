import React, { useState, useRef, useEffect } from 'react';
import { LANGUAGES } from '../constants';
import { useI18n } from '../hooks/useI18n';
import { AnimatePresence, motion } from 'framer-motion';

// SVG Flag components
const FrFlagIcon = () => <svg width="20" height="15" viewBox="0 0 3 2"><path fill="#fff" d="M0 0h3v2H0z"/><path fill="#002654" d="M0 0h1v2H0z"/><path fill="#CE1126" d="M2 0h1v2H2z"/></svg>;
const EnFlagIcon = () => <svg width="20" height="15" viewBox="0 0 60 30"><clipPath id="a"><path d="M0 0v30h60V0z"/></clipPath><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6"/><path d="M0 0l60 30m0-30L0 30" clipPath="url(#a)" stroke="#C8102E" strokeWidth="4"/><path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6"/></svg>;
const DeFlagIcon = () => <svg width="20" height="15" viewBox="0 0 5 3"><path d="M0 0h5v3H0z"/><path fill="#D00" d="M0 1h5v1H0z"/><path fill="#FFCE00" d="M0 2h5v1H0z"/></svg>;
const PtFlagIcon = () => <svg width="20" height="15" viewBox="0 0 300 200"><path fill="#006241" d="M0 0h120v200H0z"/><path fill="#D21034" d="M120 0h180v200H120z"/><g transform="translate(120 100) scale(3.5)"><circle fill="#fff" r="20"/><path id="b" fill="none" stroke="#DAA520" strokeWidth="2.5" d="M-15 0a15 15 0 0130 0 15 15 0 01-30 0"/><circle fill="#006241" r="12"/><g id="c" fill="#fff"><path d="M-6 0h12v-3a6 6 0 00-12 0z"/><path d="M-6 0h12v3a6 6 0 01-12 0z"/></g><use href="#c" transform="rotate(45)"/><use href="#c" transform="rotate(90)"/><use href="#c" transform="rotate(135)"/><use href="#c" transform="rotate(180)"/><use href="#c" transform="rotate(225)"/><use href="#c" transform="rotate(270)"/><use href="#c" transform="rotate(315)"/><circle fill="#D21034" r="7"/><g fill="#DAA520"><use href="#b" transform="scale(.8)"/><circle r="2.5"/></g></g></svg>;

const flagMap: Record<string, React.ReactNode> = {
  fr: <FrFlagIcon />,
  en: <EnFlagIcon />,
  de: <DeFlagIcon />,
  pt: <PtFlagIcon />,
};

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors text-sm font-medium text-brand-black dark:text-brand-white"
      >
        <span className="flex items-center justify-center w-5 overflow-hidden rounded-sm shadow-sm">
             {flagMap[activeLang.code]}
        </span>
        <span>{activeLang.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 w-40 bg-brand-white dark:bg-brand-gray-800 rounded-lg shadow-xl py-1 z-50 ring-1 ring-black dark:ring-brand-gray-700 ring-opacity-5"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-left hover:bg-black/5 dark:hover:bg-white/10 transition-colors
                  ${language === lang.code ? 'font-semibold text-brand-gold' : 'text-brand-black dark:text-brand-white'}
                `}
              >
                <span className="flex items-center justify-center w-5 overflow-hidden rounded-sm shadow-sm opacity-80">
                    {flagMap[lang.code]}
                </span>
                <span>{lang.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSelector;