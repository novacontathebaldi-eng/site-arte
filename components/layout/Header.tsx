
import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, Search, Menu, X, Lock } from 'lucide-react';
import { useUIStore, useCartStore, useAuthStore } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';
import { useAdmin } from '../../hooks/useAdmin';
import dynamic from 'next/dynamic';

// Lazy load Admin Dashboard trigger to save bundle size
const AdminDashboard = dynamic(() => import('../AdminDashboard').then(mod => mod.AdminDashboard), { ssr: false });

export const Header: React.FC = () => {
  const { isCartOpen, toggleCart, isMobileMenuOpen, toggleMobileMenu, toggleSearch, openAuthModal, toggleDashboard, isDashboardOpen } = useUIStore();
  const { items } = useCartStore();
  const { user } = useAuthStore();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerClasses = scrolled
    ? 'bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md shadow-sm py-3 text-primary dark:text-white border-gray-200 dark:border-white/10'
    : 'bg-transparent py-6 text-white border-transparent';

  const contentColorClass = scrolled 
    ? 'text-primary dark:text-white' 
    : 'text-white';

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
        if (!isDashboardOpen) toggleDashboard();
    } else {
        openAuthModal('login');
    }
  };

  return (
    <>
    <motion.header
      className={`fixed top-0 w-full z-[60] transition-all duration-300 border-b ${headerClasses}`}
      {...({
          initial: { y: -100 },
          animate: { y: 0 },
          transition: { duration: 0.5 }
      } as any)}
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
          {/* Admin Toggle */}
          {isAdmin && (
            <button 
                onClick={() => setShowAdminPanel(true)} 
                className="hover:text-red-500 transition-colors" 
                title="Painel Administrativo"
            >
                <Lock size={18} />
            </button>
          )}

          <button onClick={toggleSearch} className="hover:text-accent transition-colors cursor-pointer" aria-label={t('common.search')}>
            <Search size={20} />
          </button>
          
          <button 
            onClick={handleUserClick}
            className="hover:text-accent transition-colors flex items-center gap-2 cursor-pointer"
          >
            <User size={20} />
            {mounted && user && <span className="text-xs uppercase tracking-wider">{user.displayName?.split(' ')[0]}</span>}
          </button>

          <button id="header-cart-btn" onClick={toggleCart} className="relative hover:text-accent transition-colors cursor-pointer" aria-label={t('cart.title')}>
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
    
    <AdminDashboard isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </>
  );
};
