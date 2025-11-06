
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { Language } from '../types';
import { translations } from '../lib/translations';
import { LANGUAGES } from '../constants';

// Este arquivo é o cérebro do sistema de múltiplos idiomas.
// Ele cria um "Contexto" que permite que qualquer componente do site
// acesse o idioma atual e as traduções sem precisar passar props de um para o outro.

// 1. Define o que o nosso Contexto vai fornecer.
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string; // A função de tradução
}

// 2. Cria o Contexto com um valor padrão.
export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 3. Cria o "Provedor" do Contexto. É ele que vai gerenciar o estado do idioma.
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr'); // Francês como padrão inicial

  // 4. useEffect para carregar o idioma salvo na primeira vez que o site abre.
  useEffect(() => {
    // Tenta pegar o idioma salvo no navegador do usuário (localStorage).
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && LANGUAGES.some(l => l.code === savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Se não tiver nada salvo, tenta usar o idioma do navegador.
      const browserLang = navigator.language.split('-')[0] as Language;
      if (LANGUAGES.some(l => l.code === browserLang)) {
        setLanguage(browserLang);
      }
      // Se nem isso funcionar, o padrão 'fr' será usado.
    }
  }, []);

  // 5. useEffect para salvar o idioma no localStorage sempre que ele for alterado.
  useEffect(() => {
    localStorage.setItem('language', language);
    // Também atualiza o atributo 'lang' na tag <html> para acessibilidade e SEO.
    document.documentElement.lang = language;
  }, [language]);

  // 6. A função de tradução `t`.
  // Ela recebe uma chave (ex: "home.heroTitle") e retorna o texto no idioma atual.
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Se a tradução não for encontrada, retorna a chave para sabermos o que faltou.
        return key;
      }
    }
    return result;
  };

  // 7. useMemo para otimização. Ele garante que o objeto 'value' só seja recriado
  // se o idioma mudar, evitando re-renderizações desnecessárias.
  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  // 8. Retorna o Provedor, disponibilizando o 'value' para todos os componentes filhos.
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
