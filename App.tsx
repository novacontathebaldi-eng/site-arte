import React from 'react';
import { useRouter } from './hooks/useRouter';
import AdminPanel from './components/admin/AdminPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import CatalogPage from './components/CatalogPage';
import ProductDetailPage from './components/ProductDetailPage';

const PageContent: React.FC = () => {
    const { path } = useRouter();

    if (path.startsWith('/product/')) {
        const id = path.split('/product/').pop() || '';
        return <ProductDetailPage productId={id} />;
    }

    if (path === '/catalog' || path.startsWith('/catalog?')) {
        return <CatalogPage />;
    }

    // Default to homepage for '/' or any other route
    return <HomePage />;
};


const App: React.FC = () => {
  const { route } = useRouter();

  if (route.startsWith('/admin')) {
    return <AdminPanel route={route} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-brand-white">
      <Header />
      <main className="flex-grow">
        <PageContent />
      </main>
      <Footer />
    </div>
  );
};

export default App;
