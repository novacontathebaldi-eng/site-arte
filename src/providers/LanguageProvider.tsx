'use client';

import React, { useEffect } from 'react';
import { useLanguageStore } from '@/store/languageStore';

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { initializeLanguage } = useLanguageStore();

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  return <>{children}</>;
};