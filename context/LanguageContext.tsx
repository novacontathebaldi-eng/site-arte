
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage } from '../types';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): SupportedLanguage => {
  const storedLang = localStorage.getItem('language') as SupportedLanguage;
  if (storedLang && ['fr', 'en', 'de', 'pt'].includes(storedLang)) {
    return storedLang;
  }
  const browserLang = navigator.language.split('-')[0];
  if (['fr', 'en', 'de', 'pt'].includes(browserLang)) {
    return browserLang as SupportedLanguage;
  }
  return 'fr'; // Default language
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
