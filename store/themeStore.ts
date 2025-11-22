import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Theme } from '../types';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: Theme.SYSTEM,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => {
        const current = get().theme;
        const next = current === Theme.DARK ? Theme.LIGHT : Theme.DARK;
        set({ theme: next });
      },
    }),
    { name: 'theme-storage' }
  )
);
