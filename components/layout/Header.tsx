
import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, Search, Menu, X, Lock, Loader2, ChevronRight, Instagram, Mail } from 'lucide-react';
import { useUIStore, useCartStore, useAuthStore } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../hooks/useAdmin';
import dynamic from 'next/dynamic';

// Lazy load Admin Dashboard trigger to save bundle size
const AdminDashboard = dynamic(() => import('../AdminDashboard').then(mod => mod.AdminDashboard), { ssr: false });

export const Header: React.FC = () => {
  const { 
    isCartOpen, toggleCart, 
    isMobileMenuOpen, toggleMobileMenu, 
    toggleSearch, 
    openAuthModal, 
    openDashboard, 
    closeAllOverlays 
  } = useUIStore();
  
  const { items } = useCartStore();
  const { user, isLoading } = useAuthStore();
  const { isAdmin } = useAdmin();
  const { t } = useLanguage();
  
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
        // Reduced threshold to 10px for faster reaction on mobile
        setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Increased opacity to /95 to fix "transparent header" issue on mobile
  // Used fixed heights (h-16 mobile, h-20 desktop) instead of padding to match Catalog sticky position
  const headerClasses = scrolled
    ? 'bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl shadow-sm text-primary dark:text-white border-gray-200 dark:border-white/10'
    : 'bg-transparent text-white border-transparent';

  const contentColorClass = scrolled 
    ? 'text-primary dark:text-white' 
    : 'text-white';

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    if (user) {
        openDashboard();
    } else {
        openAuthModal('login');
    }
  };

  const handleNavClick = (id: string) => {
    toggleMobileMenu();
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <motion.header
      className={`fixed top-0 w-full z-[60] transition-all duration-300 border-b h-16 md:h-20 flex items-center ${headerClasses}`}
      {...({
          initial: { y: -100 },
          animate: { y: 0 },
          transition: { duration: 0.5 }
      } as any)}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center h-full">
        {/* Logo */}
        <div className="flex items-center z-50 cursor-pointer flex-shrink-1 overflow-hidden" onClick={() => {
            closeAllOverlays();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }}>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent rounded-full flex items-center justify-center mr-2 md:mr-3 flex-shrink-0">
                <span className="font-serif font-bold text-white text-lg md:text-xl">M</span>
            </div>
            <span className={`font-serif text-sm md:text-2xl font-bold tracking-tighter truncate ${scrolled ? 'text-primary dark:text-white' : 'text-white mix-blend-difference'}`}>
                MELISSA PELUSSI
            </span>
        </div>

        {/* Icons Section */}
        <div className={`flex items-center gap-2 md:gap-6 ${contentColorClass} flex-shrink-0 ml-2`}>
          
          {/* Admin Toggle */}
          {isAdmin && (
            <button 
                onClick={() => setShowAdminPanel(true)} 
                className="hidden md:block hover:text-red-500 transition-colors" 
                title="Painel Administrativo"
            >
                <Lock size={18} />
            </button>
          )}

          {/* Search Icon */}
          <button onClick={toggleSearch} className="hover:text-accent transition-colors cursor-pointer p-1.5 md:p-1" aria-label={t('common.search')}>
            <Search size={20} className="md:w-5 md:h-5 w-4 h-4" />
          </button>
          
          {/* User / Login Icon */}
          <button 
            onClick={handleUserClick}
            className="hover:text-accent transition-colors flex items-center gap-2 cursor-pointer relative p-1.5 md:p-1"
            disabled={isLoading}
          >
            {isLoading ? (
                <Loader2 size={20} className="animate-spin opacity-50 md:w-5 md:h-5 w-4 h-4" />
            ) : (
                <>
                    <User size={20} className="md:w-5 md:h-5 w-4 h-4" />
                    {mounted && user && <span className="hidden md:inline text-xs uppercase tracking-wider font-medium">{user.displayName?.split(' ')[0]}</span>}
                </>
            )}
          </button>

          {/* Cart Icon */}
          <button id="header-cart-btn" onClick={toggleCart} className="relative hover:text-accent transition-colors cursor-pointer p-1.5 md:p-1" aria-label={t('cart.title')}>
            <ShoppingBag size={20} className="md:w-5 md:h-5 w-4 h-4" />
            {mounted && items.length > 0 && (
              <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-accent text-white text-[9px] md:text-[10px] font-bold w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center animate-pulse">
                {items.length}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button className={`md:hidden z-50 p-1.5 ${contentColorClass}`} onClick={toggleMobileMenu} aria-label="Menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </motion.header>
    
    {/* MOBILE MENU OVERLAY */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          className="fixed inset-0 z-[55] bg-black/95 backdrop-blur-xl flex flex-col pt-24 px-6 md:hidden"
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex flex-col gap-6 mt-8">
            <button 
              onClick={() => handleNavClick('catalog')} 
              className="text-2xl font-serif text-white flex items-center justify-between border-b border-white/10 pb-4"
            >
              {t('nav.catalog')}
              <ChevronRight size={20} className="text-gray-500" />
            </button>
            <button 
              onClick={() => handleNavClick('about')} 
              className="text-2xl font-serif text-white flex items-center justify-between border-b border-white/10 pb-4"
            >
              {t('nav.about')}
              <ChevronRight size={20} className="text-gray-500" />
            </button>
            <button 
              onClick={() => handleNavClick('newsletter')} 
              className="text-2xl font-serif text-white flex items-center justify-between border-b border-white/10 pb-4"
            >
              {t('nav.contact')}
              <ChevronRight size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="mt-auto mb-12 space-y-6">
            <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Instagram size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Mail size={20} />
                </a>
            </div>
            <p className="text-gray-500 text-xs uppercase tracking-widest">
                © 2025 Melissa Pelussi
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AdminDashboard isOpen={showAdminPanel} onClose={() => setShowAdminPanel(false)} />
    </>
  );
};
