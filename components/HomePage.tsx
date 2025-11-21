import React from 'react';
import Hero from './Hero';
import FeaturedProducts from './FeaturedProducts';
import Newsletter from './Newsletter';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      {/* The Hero component itself handles the 200vh scroll distance internally relative to window, 
          but visually acts as the start of our experience */}
      <Hero />
      
      {/* Subsequent sections snap into place */}
      <FeaturedProducts />
      
      <Newsletter />
    </div>
  );
};

export default HomePage;