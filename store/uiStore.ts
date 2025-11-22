import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../types';

interface UIState {
  language: Language;
  isCartOpen: boolean;
  isChatOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  // Modals
  activeModal: string | null;
  
  setLanguage: (lang: Language) => void;
  toggleCart: () => void;
  toggleChat: () => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  closeAllOverlays: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      language: Language.FR,
      isCartOpen: false,
      isChatOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
      activeModal: null,

      setLanguage: (language) => set({ language }),
      
      toggleCart: () => set((state) => ({ 
        isCartOpen: !state.isCartOpen, 
        isChatOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false 
      })),
      
      toggleChat: () => set((state) => ({ 
        isChatOpen: !state.isChatOpen, 
        isCartOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false 
      })),
      
      toggleSearch: () => set((state) => ({ 
        isSearchOpen: !state.isSearchOpen,
        isCartOpen: false,
        isChatOpen: false
      })),
      
      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen,
        isCartOpen: false,
        isChatOpen: false
      })),

      openModal: (modalName) => set({ activeModal: modalName }),
      closeModal: () => set({ activeModal: null }),

      closeAllOverlays: () => set({ 
        isCartOpen: false, 
        isChatOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false,
        activeModal: null
      }),
    }),
    { 
      name: 'ui-storage', 
      partialize: (state) => ({ language: state.language }) 
    }
  )
);
