import React, { useState } from 'react';
import Chatbot from './components/Chatbot';
import { Product } from './types';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AdminPage from './pages/AdminPage';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './components/admin/AdminLayout'; // Import the Admin Layout

export type View = 'home' | 'catalog' | 'productDetail' | 'admin';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();

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
    if (currentView === 'admin' && user?.role === 'admin') {
      return (
        <AdminLayout onNavigate={navigateTo}>
          <AdminPage />
        </AdminLayout>
      );
    }

    // Default public view
    let pageComponent;
    switch (currentView) {
      case 'catalog':
        pageComponent = <CatalogPage onProductSelect={handleProductSelect} />;
        break;
      case 'productDetail':
        pageComponent = <ProductDetailPage product={selectedProduct!} onBackToCatalog={handleBackToCatalog} />;
        break;
      case 'home':
      default:
        pageComponent = <HomePage onNavigateToCatalog={() => navigateTo('catalog')} onProductSelect={handleProductSelect} />;
        break;
    }

    return (
      <div className="min-h-screen bg-base-100 text-base-text font-sans flex flex-col">
        <Header 
          onNavigate={navigateTo} 
          onAuthClick={() => setAuthModalOpen(true)}
        />
        <main className="flex-grow">
          {pageComponent}
        </main>
        <Footer onNavigate={navigateTo} />
        <Chatbot />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    );
  };

  return <>{renderView()}</>;
};

export default App;