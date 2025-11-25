
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language } from '../types';

interface UIState {
  // Persisted State
  language: Language;
  setLanguage: (lang: Language) => void;

  // Ephemeral UI State (Reset on refresh)
  isCartOpen: boolean;
  isChatOpen: boolean;
  isSearchOpen: boolean;
  isMobileMenuOpen: boolean;
  isAuthOpen: boolean;
  authView: 'login' | 'register';
  isDashboardOpen: boolean;
  activeModal: string | null;
  
  // Chat Context
  chatInitialMessage: string | null;

  // Actions
  toggleCart: () => void;
  toggleChat: () => void;
  openChatWithContext: (message: string) => void;
  clearChatContext: () => void;

  toggleSearch: () => void;
  toggleMobileMenu: () => void;
  toggleDashboard: () => void;
  
  openAuthModal: (view?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  
  openDashboard: () => void;
  closeDashboard: () => void;

  openModal: (modalName: string) => void;
  closeModal: () => void;
  
  closeAllOverlays: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Defaults
      language: Language.FR,
      isCartOpen: false,
      isChatOpen: false,
      isSearchOpen: false,
      isMobileMenuOpen: false,
      isAuthOpen: false,
      authView: 'login',
      isDashboardOpen: false,
      activeModal: null,
      chatInitialMessage: null,

      setLanguage: (language) => set({ language }),

      // Simple Toggles (Close others when opening one)
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

      openChatWithContext: (message) => set({
        isChatOpen: true,
        chatInitialMessage: message,
        isCartOpen: false,
        isSearchOpen: false,
        isMobileMenuOpen: false,
        isAuthOpen: false,
        isDashboardOpen: false
      }),

      clearChatContext: () => set({ chatInitialMessage: null }),

      toggleSearch: () => set((state) => ({ 
        isSearchOpen: !state.isSearchOpen,
        isCartOpen: false,
        isChatOpen: false,
        isMobileMenuOpen: false 
      })),

      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen,
        isCartOpen: false,
        isChatOpen: false 
      })),

      toggleDashboard: () => set((state) => ({
        isDashboardOpen: !state.isDashboardOpen,
        isAuthOpen: false,
        isCartOpen: false,
        isMobileMenuOpen: false,
        isChatOpen: false
      })),

      // Explicit Actions for Auth/Dashboard
      openAuthModal: (view = 'login') => set({
        isAuthOpen: true,
        authView: view,
        isCartOpen: false,
        isMobileMenuOpen: false,
        isDashboardOpen: false,
        isChatOpen: false
      }),

      closeAuthModal: () => set({ isAuthOpen: false }),

      openDashboard: () => set({
        isDashboardOpen: true,
        isAuthOpen: false,
        isCartOpen: false,
        isMobileMenuOpen: false,
        isChatOpen: false
      }),

      closeDashboard: () => set({ isDashboardOpen: false }),

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
      })
    }),
    {
      name: 'ui-storage', // Key in localStorage
      partialize: (state) => ({ language: state.language }), // ONLY persist language
    }
  )
);
