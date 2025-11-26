
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Catalog } from '../../components/Catalog';

// Global Components are needed here to ensure SPA state persistence and functionality
const CartSidebar = dynamic(() => import('../../components/CartSidebar').then(mod => mod.CartSidebar), { ssr: false });
const Chatbot = dynamic(() => import('../../components/Chatbot').then(mod => mod.Chatbot), { ssr: false });
const FloatingCartButton = dynamic(() => import('../../components/FloatingCartButton').then(mod => mod.FloatingCartButton), { ssr: false });
const AuthModal = dynamic(() => import('../../components/auth/AuthModal').then(mod => mod.AuthModal), { ssr: false });
const Dashboard = dynamic(() => import('../../components/Dashboard').then(mod => mod.Dashboard), { ssr: false });

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-light dark:bg-[#252525] relative">
        <Header />
        
        {/* Padding top to account for fixed header */}
        <main className="pt-20 md:pt-24">
            <Catalog />
        </main>

        <Footer />

        {/* Global Interactive Elements */}
        <CartSidebar />
        <Chatbot />
        <FloatingCartButton />
        <AuthModal />
        <Dashboard />
    </div>
  );
}
