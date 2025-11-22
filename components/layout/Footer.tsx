import React, { useEffect, useState, useRef } from 'react';
import { Globe, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../store';
import { Theme, Language } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';

export const Footer: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
        if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
            setIsLangOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: Language.FR, flagUrl: 'https://flagcdn.com/w40/fr.png', label: 'FR' },
    { code: Language.EN, flagUrl: 'https://flagcdn.com/w40/gb.png', label: 'EN' },
    { code: Language.DE, flagUrl: 'https://flagcdn.com/w40/de.png', label: 'DE' },
    { code: Language.PT, flagUrl: 'https://flagcdn.com/w40/pt.png', label: 'PT' },
  ];

  return (
    // ADICIONADO pb-32 para dar espaço ao botão flutuante do chat
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-32 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Bio */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl text-accent">Melissa Pelussi</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>
          
          {/* Column 2: Links */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">{t('footer.links')}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-accent transition-colors">{t('nav.catalog')}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t('nav.about')}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">{t('footer.legal')}</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><a href="#" className="hover:text-accent transition-colors">{t('footer.terms')}</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">{t('footer.privacy')}</a></li>
            </ul>
          </div>

          {/* Column 4: Settings (Language & Theme) */}
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-gray-500">{t('footer.settings')}</h4>
            
            <div className="flex flex-col gap-3 items-start w-[120px]">
                
                {/* Language Selector */}
                <div className="relative w-full" ref={langMenuRef}>
                    <button 
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className="w-full flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-md transition-all duration-300 group"
                    >
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors truncate mr-1">
                            {t('footer.language')}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                             <div className="w-px h-3 bg-white/20" />
                             <Globe size={14} className="text-accent group-hover:scale-110 transition-transform" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isLangOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-full mb-2 left-0 w-full bg-[#252525] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-30 p-1"
                            >
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code);
                                            setIsLangOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${
                                            language === lang.code 
                                            ? 'bg-accent text-white' 
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <img 
                                                src={lang.flagUrl} 
                                                alt={lang.label}
                                                className="w-4 h-auto rounded-sm shadow-sm object-cover"
                                            />
                                            <span className="uppercase font-medium tracking-wider text-[10px]">{lang.label}</span>
                                        </span>
                                        {language === lang.code && <div className="w-1 h-1 rounded-full bg-white" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Theme Selector */}
                <div className="w-full grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                    {mounted && [Theme.LIGHT, Theme.DARK, Theme.SYSTEM].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`flex items-center justify-center p-1.5 rounded-md transition-all duration-300 ${
                                theme === t 
                                ? 'bg-white text-black shadow-sm' /* Correção aqui: text-black para forçar contraste */
                                : 'text-gray-500 hover:text-white hover:bg-white/10'
                            }`}
                            title={`Theme: ${t}`}
                            aria-label={`Switch to ${t} theme`}
                        >
                            {t === Theme.LIGHT && <Sun size={14} />}
                            {t === Theme.DARK && <Moon size={14} />}
                            {t === Theme.SYSTEM && <Monitor size={14} />}
                        </button>
                    ))}
                </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2025 Melissa Pelussi. {t('footer.rights')}</p>
          <p>{t('footer.designed')}</p>
        </div>
      </div>
    </footer>
  );
};