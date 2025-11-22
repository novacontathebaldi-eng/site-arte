import React from 'react';
import { useRouter } from './hooks/useRouter';
import AdminPanel from './components/admin/AdminPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ProductDetailPage from './components/ProductDetailPage';
import CheckoutPage from './components/checkout/CheckoutPage';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import DashboardLayout from './components/dashboard/DashboardLayout';
import CartSidebar from './components/CartSidebar';
import FloatingCartButton from './components/FloatingCartButton';
import CatalogPage from './components/CatalogPage';

const PageContent: React.FC = () => {
    const { path } = useRouter();

    if (path.startsWith('/product/')) {
        const id = path.split('/product/').pop() || '';
        return <ProductDetailPage productId={id} />;
    }

    if (path.startsWith('/catalog')) {
        return <CatalogPage />;
    }

    if (path.startsWith('/checkout')) {
      return <CheckoutPage />;
    }
    
    if (path.startsWith('/order-confirmation')) {
      return <OrderConfirmationPage />;
    }

    if (path.startsWith('/dashboard')) {
        return <DashboardLayout />;
    }


    // Default to homepage for '/' or any other route
    return <HomePage />;
};


const App: React.FC = () => {
  const { route } = useRouter();

  if (route.startsWith('/admin')) {
    return <AdminPanel />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <PageContent />
      </main>
      <CartSidebar />
      <FloatingCartButton />
      <Footer />
    </div>
  );
};

export default App;
