import React, { useEffect } from 'react';
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
import Lenis from '@studio-freight/lenis';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/common/SEO';

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

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  if (route.startsWith('/admin')) {
    return (
      <HelmetProvider>
        <SEO title="Admin Panel | Meeh" robots="noindex, nofollow" />
        <AdminPanel />
      </HelmetProvider>
    );
  }
  
  return (
    <HelmetProvider>
      <SEO />
      <div className="flex flex-col min-h-screen font-sans">
        <Header />
        <main className="flex-grow">
          <PageContent />
        </main>
        <CartSidebar />
        <FloatingCartButton />
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default App;