
'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useThemeStore, useAuthStore } from './store';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/Hero';
import { Newsletter } from './components/Newsletter';
import { FeaturedCollection } from './components/FeaturedCollection';
import { Theme } from './types';
import { useLanguage } from './hooks/useLanguage';
import { motion } from 'framer-motion';

// Lazy Loaded Components
const CartSidebar = dynamic(() => import('./components/CartSidebar').then(mod => mod.CartSidebar), { 
  ssr: false 
});
const Chatbot = dynamic(() => import('./components/Chatbot').then(mod => mod.Chatbot), { 
  ssr: false 
});
const FloatingCartButton = dynamic(() => import('./components/FloatingCartButton').then(mod => mod.FloatingCartButton), { 
  ssr: false 
});

// New Components
const AuthModal = dynamic(() => import('./components/auth/AuthModal').then(mod => mod.AuthModal), { ssr: false });
const Dashboard = dynamic(() => import('./components/Dashboard').then(mod => mod.Dashboard), { ssr: false });

const App: React.FC = () => {
  const { theme } = useThemeStore();
  const { checkAuth } = useAuthStore(); // Auth Store
  const { t } = useLanguage();

  // Initialize Auth Listener Globally
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Setup Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === Theme.SYSTEM) {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
    } else {
        root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="min-h-screen relative">
        <Header />
        
        <main>
            {/* Hero Section */}
            <Hero />

            {/* About Section (Snapshot) */}
            <section id="about" className="min-h-[80vh] flex items-center justify-center bg-white dark:bg-[#1a1a1a] py-20 px-6">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        className="relative"
                        {...({
                            initial: { opacity: 0, x: -50 },
                            whileInView: { opacity: 1, x: 0 },
                            viewport: { once: true },
                            transition: { duration: 0.8 }
                        } as any)}
                    >
                        {/* Image */}
                        <div className="aspect-[3/4] w-full overflow-hidden rounded-sm shadow-2xl">
                             <motion.img 
                                src="https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=1000&auto=format&fit=crop" 
                                alt="Melissa Pelussi Art Studio" 
                                className="w-full h-full object-cover"
                                {...({
                                    initial: { filter: "grayscale(100%)" },
                                    whileInView: { filter: "grayscale(0%)" },
                                    viewport: { once: true, amount: 0.3 }, // Changed: once: true ensures it stays colored
                                    transition: { duration: 1.5, ease: "easeInOut" }
                                } as any)}
                            />
                        </div>
                        {/* Decorative Element */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-accent z-[-1]" />
                    </motion.div>
                    <motion.div 
                         className="space-y-6"
                         {...({
                            initial: { opacity: 0, x: 50 },
                            whileInView: { opacity: 1, x: 0 },
                            viewport: { once: true },
                            transition: { duration: 0.8, delay: 0.2 }
                         } as any)}
                    >
                        <h2 className="font-serif text-4xl md:text-5xl text-primary dark:text-white">{t('about.title')}</h2>
                        <div className="w-20 h-1 bg-accent" />
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('about.bio_p1')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('about.bio_p2')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Featured Collection Section (Replaces full Catalog) */}
            <FeaturedCollection />

            {/* Newsletter Section */}
            <div id="newsletter">
                <Newsletter />
            </div>
        </main>

        <Footer />

        {/* Global Interactive Elements */}
        <CartSidebar />
        <Chatbot />
        <FloatingCartButton />
        
        {/* Auth & Dashboard Layers */}
        <AuthModal />
        <Dashboard />
    </div>
  );
};

export default App;
