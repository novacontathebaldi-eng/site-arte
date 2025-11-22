import React from 'react';
import Hero from './Hero';
import FeaturedProducts from './FeaturedProducts';
import Newsletter from './Newsletter';

const HomePage: React.FC = () => {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Newsletter />
    </>
  );
};

export default HomePage;
