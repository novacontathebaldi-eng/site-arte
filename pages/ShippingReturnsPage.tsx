import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const ShippingReturnsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto prose">
        <h1>Shipping & Returns</h1>
        
        <h2>Shipping Policy</h2>
        <p>We ship artworks worldwide from Luxembourg. All pieces are securely packaged and insured.</p>
        <ul>
            <li><strong>Processing Time:</strong> 1-3 business days.</li>
            <li><strong>Estimated Delivery (Standard):</strong>
                <ul>
                    <li>Luxembourg: 1-2 days</li>
                    <li>European Union: 3-7 days</li>
                    <li>Brazil: 10-20 days</li>
                    <li>Rest of World: 10-25 days</li>
                </ul>
            </li>
        </ul>
        <p>Please note that customers are responsible for any customs and import duties that may apply.</p>
        
        <h2>Return Policy</h2>
        <p>In compliance with EU law, you have 14 days from the date of delivery to return an artwork.</p>
        <p>To be eligible for a return, the item must be in its original condition and packaging, with the certificate of authenticity included. The buyer is responsible for return shipping costs. Commissioned or personalized works are not eligible for returns.</p>
        <p>To initiate a return, please contact us through the contact page.</p>

      </div>
    </div>
  );
};

export default ShippingReturnsPage;
