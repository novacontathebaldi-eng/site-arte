
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
  
  const getTranslated = <T,>(obj: T, key: keyof T, lang: SupportedLanguage = language): string => {
    if (obj && typeof obj === 'object' && 'translations' in obj && typeof obj.translations === 'object' && obj.translations && lang in obj.translations) {
        const typedTranslations = obj.translations as Record<SupportedLanguage, Record<string, string>>;
        const translation = typedTranslations[lang];
        if (translation && typeof translation === 'object' && String(key) in translation) {
            return translation[String(key)];
        }
    }
    // Fallback logic
    if (obj && typeof obj === 'object' && key in obj) {
        return String(obj[key]);
    }
    return '';
  };

  return { t, language, getTranslated };
};
