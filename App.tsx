import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import { Product } from './types';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

type View = 'home' | 'catalog' | 'productDetail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('productDetail');
    window.scrollTo(0, 0);
  };
  
  const handleBackToCatalog = () => {
    setSelectedProduct(null);
    setCurrentView('catalog');
    window.scrollTo(0, 0);
  };
  
  const navigateTo = (view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  }

  const renderView = () => {
    switch (currentView) {
      case 'catalog':
        return <CatalogPage onProductSelect={handleProductSelect} />;
      case 'productDetail':
        return <ProductDetailPage product={selectedProduct!} onBackToCatalog={handleBackToCatalog} />;
      case 'home':
      default:
        return <HomePage onNavigateToCatalog={() => navigateTo('catalog')} onProductSelect={handleProductSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-text font-sans flex flex-col">
      <Header 
        onNavigate={navigateTo} 
        onAuthClick={() => setAuthModalOpen(true)}
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer onNavigate={navigateTo} />
      <Chatbot />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default App;