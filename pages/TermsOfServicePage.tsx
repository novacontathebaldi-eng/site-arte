import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TermsOfServicePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto prose">
        <h1>Terms of Service</h1>
        
        <h2>1. Agreement to Terms</h2>
        <p>By using our website, you agree to be bound by these Terms of Service.</p>

        <h2>2. Intellectual Property</h2>
        <p>All artwork and content on this site are the exclusive property of Melissa Pelussi. Unauthorized use, reproduction, or distribution is strictly prohibited.</p>
        
        <h2>3. Orders and Payment</h2>
        <p>We reserve the right to refuse or cancel any order for any reason. By providing payment information, you represent that you are authorized to use the payment method.</p>

        <h2>4. Limitation of Liability</h2>
        <p>We are not liable for any indirect, incidental, or consequential damages arising out of your use of this website or the purchase of any products.</p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
