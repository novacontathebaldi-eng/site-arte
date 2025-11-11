import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { LANGUAGES } from '../constants';

// Ícone de Seta para o dropdown
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 20 20" height="1em" width="1em" {...props}>
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

// Este componente cria o seletor de idiomas (o botão com a bandeira que abre a lista de idiomas).
const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  // Este useEffect fecha o dropdown se o usuário clicar fora dele.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // FIX: Cast event.target to HTMLElement to handle DOM node types correctly.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLElement)) {
        setIsOpen(false);
      }
    };
    // FIX: Add guard for document to avoid errors in non-browser environments.
    if (typeof document !== 'undefined') {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleLanguageChange = (langCode: typeof language) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão que mostra a bandeira do idioma atual */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-transparent rounded-md hover:bg-surface transition-colors"
      >
        <selectedLanguage.icon className="w-6 h-6 rounded-full object-cover" />
        <ChevronDownIcon className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* O menu dropdown que aparece ao clicar */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left flex items-center space-x-3 px-4 py-2 text-sm ${
                  language === lang.code ? 'bg-surface text-text-primary' : 'text-text-secondary hover:bg-surface'
                }`}
              >
                <lang.icon className="w-5 h-5 rounded-full object-cover" />
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;