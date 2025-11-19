import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language } from '../types';
import { translations } from '../lib/translations';

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && ['fr', 'en', 'de', 'pt'].includes(storedLang)) {
      return storedLang;
    }
    const browserLang = navigator.language.split(/[-_]/)[0] as Language;
    if (['fr', 'en', 'de', 'pt'].includes(browserLang)) {
      return browserLang;
    }
  }
  return 'fr';
};


export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: string): string => {
    const path = key.split('.');
    const result = path.reduce(
      (obj: any, currentKey: string) => obj?.[currentKey],
      translations[language]
    );
    return result || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};