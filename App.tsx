import React from 'react';
import { SAMPLE_PRODUCTS } from './constants';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';
import { useRouter } from './hooks/useRouter';
import AdminPanel from './components/admin/AdminPanel';

const App: React.FC = () => {
  const { route } = useRouter();

  if (route.startsWith('/admin')) {
    return <AdminPanel route={route} />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProductGrid products={SAMPLE_PRODUCTS} />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default App;