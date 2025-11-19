import React from 'react';
import { SAMPLE_PRODUCTS } from './constants';
import Header from './components/Header';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <ProductGrid products={SAMPLE_PRODUCTS} />
      </main>
      <Footer />
    </div>
  );
};

export default App;
