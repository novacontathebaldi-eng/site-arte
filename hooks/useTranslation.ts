
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { translations } from '../constants';
import { SupportedLanguage } from '../types';

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }

  const { language } = context;

  const t = (key: string): string => {
    return translations[language][key] || key;
  };
  
  const getTranslated = <T, K extends keyof T>(obj: T, key: K, lang: SupportedLanguage = language): string => {
    if (obj && typeof obj === 'object' && 'translations' in obj && typeof obj.translations === 'object' && obj.translations && lang in obj.translations) {
        const langTranslations = (obj.translations as any)[lang];
        if (langTranslations && typeof langTranslations === 'object' && key in langTranslations) {
            const value = langTranslations[key as keyof typeof langTranslations];
            if (typeof value === 'string') {
              return value;
            }
        }
    }
    // Fallback logic for non-translatable fields
    if (obj && typeof obj === 'object' && key in obj) {
        const value = obj[key];
        if(typeof value === 'string' || typeof value === 'number') {
          return String(value);
        }
    }
    return '';
  };

  return { t, language, getTranslated };
};