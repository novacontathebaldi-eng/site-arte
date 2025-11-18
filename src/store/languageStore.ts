import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '@/lib/i18n';

interface LanguageState {
  currentLanguage: 'fr' | 'en' | 'de' | 'pt';
  setLanguage: (language: 'fr' | 'en' | 'de' | 'pt') => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'fr',

      setLanguage: (language: 'fr' | 'en' | 'de' | 'pt') => {
        set({ currentLanguage: language });
        i18n.changeLanguage(language);
        
        // Update HTML lang attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
        }
      },

      initializeLanguage: () => {
        // Get language from localStorage (handled by persist)
        const storedLanguage = get().currentLanguage;
        
        // Get language from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const urlLanguage = urlParams.get('lang') as 'fr' | 'en' | 'de' | 'pt';
        
        // Get language from browser
        const browserLanguage = navigator.language.split('-')[0];
        
        // Determine final language
        let finalLanguage: 'fr' | 'en' | 'de' | 'pt' = 'fr';
        
        if (urlLanguage && ['fr', 'en', 'de', 'pt'].includes(urlLanguage)) {
          finalLanguage = urlLanguage;
        } else if (storedLanguage) {
          finalLanguage = storedLanguage;
        } else if (['fr', 'en', 'de', 'pt'].includes(browserLanguage)) {
          finalLanguage = browserLanguage as 'fr' | 'en' | 'de' | 'pt';
        }
        
        // Set the language
        get().setLanguage(finalLanguage);
      }
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({
        currentLanguage: state.currentLanguage
      })
    }
  )
);