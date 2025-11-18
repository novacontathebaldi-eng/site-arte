import React, { createContext, useState, useEffect, useCallback } from 'react';

type Language = 'en' | 'fr' | 'de' | 'pt';
type Translations = Record<string, any>;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

const availableLanguages: Language[] = ['en', 'fr', 'de', 'pt'];

const getInitialLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const storedLang = localStorage.getItem('language') as Language;
    if (storedLang && availableLanguages.includes(storedLang)) {
      return storedLang;
    }
    const browserLang = navigator.language.split(/[-_]/)[0] as Language;
    if (availableLanguages.includes(browserLang)) {
      return browserLang;
    }
  }
  return 'fr'; // Default language
};

// Cache for translations
const translationsCache: Partial<Record<Language, Translations>> = {};
let fallbackTranslations: Translations | null = null;

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      // Ensure fallback (English) is loaded first
      if (!fallbackTranslations) {
          try {
              const response = await fetch('./i18n/locales/en.json');
              if (!response.ok) throw new Error('Network response was not ok');
              fallbackTranslations = await response.json();
          } catch (e) {
              console.error("Fatal: Failed to load fallback translations (en).", e);
              // In a real app, you might want to show a global error message here.
              return;
          }
      }

      // Load current language if not in cache
      if (!translationsCache[language]) {
        try {
            const response = await fetch(`./i18n/locales/${language}.json`);
            if (!response.ok) throw new Error('Network response was not ok');
            translationsCache[language] = await response.json();
        } catch (error) {
            console.error(`Failed to load translations for ${language}. Falling back to English.`, error);
        }
      }
      setIsLoaded(true);
    };

    loadTranslations();
  }, [language]);


  const setLanguage = (lang: Language) => {
    if (lang !== language) {
        localStorage.setItem('language', lang);
        setIsLoaded(false); // Trigger reload of translations for the new language
        setLanguageState(lang);
    }
  };

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
      const findTranslation = (source: Translations | undefined | null, keys: string[]) => {
          let result: any = source;
          for (const k of keys) {
              result = result?.[k];
              if (result === undefined) return undefined;
          }
          return result;
      };

      const keys = key.split('.');
      let translation = findTranslation(translationsCache[language], keys);

      // If translation not found in current language, try the fallback
      if (translation === undefined) {
          translation = findTranslation(fallbackTranslations, keys);
      }
      
      // If still not found, return the key itself
      if (translation === undefined) {
          return key;
      }

      let strResult = String(translation);

      if (replacements) {
        Object.keys(replacements).forEach(placeholder => {
          strResult = strResult.replace(`{${placeholder}}`, String(replacements[placeholder]));
        });
      }
      
      return strResult;
    },
    [language]
  );
  
  // Render nothing until the essential translations are loaded to prevent FOUC
  if (!isLoaded) {
      return null;
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};
