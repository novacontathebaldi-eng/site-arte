import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  setThemeSetting: (theme: ThemeSetting) => void;
  effectiveTheme: EffectiveTheme;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const getInitialThemeSetting = (): ThemeSetting => {
  if (typeof window === 'undefined') return 'system';
  const storedTheme = localStorage.getItem('themeSetting') as ThemeSetting;
  if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
    return storedTheme;
  }
  return 'system';
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(getInitialThemeSetting());
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('light');

  useEffect(() => {
    localStorage.setItem('themeSetting', themeSetting);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      if (themeSetting === 'system') {
        setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setEffectiveTheme(themeSetting);
      }
    };

    updateTheme();

    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);

  }, [themeSetting]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
  }, [effectiveTheme]);

  const value = { themeSetting, setThemeSetting, effectiveTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
