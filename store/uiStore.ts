import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../types';

interface UIState {
  language: Language;
  isCartOpen: boolean;
  isChatOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Auth & Dashboard
  isAuthOpen: boolean;
  authView: 'login' | 'register';
  isDashboardOpen: boolean;

  // Modals
  activeModal: string | null;
  
  setLanguage: (lang: Language) => void;
  toggleCart: () => void;
  toggleChat: () => void;
  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  
  // New Toggles
  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  toggleDashboard: () => void;

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
      isAuthOpen: false,
      authView: 'login',
      isDashboardOpen: false,
      activeModal: null,

      setLanguage: (language) => set({ language }),
      
      toggleCart: () => set((state) => ({ 
        isCartOpen: !state.isCartOpen, 
        isChatOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false,
        isAuthOpen: false,
        isDashboardOpen: false
      })),
      
      toggleChat: () => set((state) => ({ 
        isChatOpen: !state.isChatOpen, 
        isCartOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false,
        isAuthOpen: false,
        isDashboardOpen: false
      })),
      
      toggleSearch: () => set((state) => ({ 
        isSearchOpen: !state.isSearchOpen,
        isCartOpen: false,
        isChatOpen: false,
        isAuthOpen: false
      })),
      
      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen,
        isCartOpen: false,
        isChatOpen: false,
        isAuthOpen: false
      })),

      openAuthModal: (view = 'login') => set({ 
        isAuthOpen: true, 
        authView: view,
        isCartOpen: false,
        isMobileMenuOpen: false,
        isDashboardOpen: false
      }),

      closeAuthModal: () => set({ isAuthOpen: false }),

      toggleDashboard: () => set((state) => ({
        isDashboardOpen: !state.isDashboardOpen,
        isAuthOpen: false,
        isCartOpen: false,
        isMobileMenuOpen: false
      })),

      openModal: (modalName) => set({ activeModal: modalName }),
      closeModal: () => set({ activeModal: null }),

      closeAllOverlays: () => set({ 
        isCartOpen: false, 
        isChatOpen: false, 
        isSearchOpen: false, 
        isMobileMenuOpen: false,
        isAuthOpen: false,
        isDashboardOpen: false,
        activeModal: null
      }),
    }),
    { 
      name: 'ui-storage', 
      partialize: (state) => ({ language: state.language }) 
    }
  )
);