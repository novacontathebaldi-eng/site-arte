import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { dictionaries } from '../lib/i18n/translations';
import { Language } from '../types';

export const useLanguage = () => {
  const { language, setLanguage } = useUIStore();

  // Set cookie when language changes to support future middleware and persistency
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Sets a cookie accessible by the server
      document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string): string => {
    // @ts-ignore
    return dictionaries[language]?.[key] || key;
  };

  return { language, setLanguage, t };
};