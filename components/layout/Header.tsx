import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useUIStore, useCartStore, useAuthStore } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { isCartOpen, toggleCart, isMobileMenuOpen, toggleMobileMenu, toggleSearch } = useUIStore();
  const { items } = useCartStore();
  const { user, login, logout } = useAuthStore();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Definição de cores baseada no estado de scroll
  // Quando scrolled: Fundo sólido (Branco no Light, Preto no Dark) e texto contrastante
  // Quando topo: Fundo transparente e texto sempre Branco (por causa do Hero)
  const headerClasses = scrolled
    ? 'bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-sm py-3 text-primary dark:text-white border-gray-200 dark:border-white/10'
    : 'bg-transparent py-6 text-white border-transparent';

  // Cor do logo e ícones quando scrolled vs topo
  const contentColorClass = scrolled 
    ? 'text-primary dark:text-white' 
    : 'text-white';

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${headerClasses}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center z-50 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mr-3">
                <span className="font-serif font-bold text-white text-xl">M</span>
            </div>
            <span className={`font-serif text-2xl font-bold tracking-tighter ${scrolled ? 'text-primary dark:text-white' : 'text-white mix-blend-difference'}`}>
                MELISSA PELUSSI
            </span>
        </div>

        {/* Desktop Icons */}
        <div className={`hidden md:flex items-center gap-6 ${contentColorClass}`}>
          <button onClick={toggleSearch} className="hover:text-accent transition-colors" aria-label={t('common.search')}>
            <Search size={20} />
          </button>
          
          <div className="relative group">
            <button className="hover:text-accent transition-colors flex items-center gap-2">
               <User size={20} />
               {mounted && user && <span className="text-xs">{user.displayName.split(' ')[0]}</span>}
            </button>
             <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 text-primary dark:text-white">
                {mounted && user ? (
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded">{t('nav.logout')}</button>
                ) : (
                    <button onClick={login} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/10 rounded">{t('nav.login')}</button>
                )}
             </div>
          </div>

          <button onClick={toggleCart} className="relative hover:text-accent transition-colors" aria-label={t('cart.title')}>
            <ShoppingBag size={20} />
            {mounted && items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button className={`md:hidden z-50 ${contentColorClass}`} onClick={toggleMobileMenu} aria-label="Menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </motion.header>
  );
};