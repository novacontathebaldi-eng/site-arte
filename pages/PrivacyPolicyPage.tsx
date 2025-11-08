import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto prose">
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2>1. Data Controller</h2>
        <p>Melissa Pelussi Art is the data controller for the personal data collected through this website.</p>

        <h2>2. Data We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, shipping address, and phone number.</p>

        <h2>3. How We Use Your Data</h2>
        <p>We use your data to process orders, communicate with you, and improve our services. We will not share your personal information with third parties except as necessary to fulfill your order (e.g., shipping carriers).</p>

        <h2>4. Your Rights</h2>
        <p>Under GDPR, you have the right to access, rectify, or erase your personal data. Please contact us to exercise these rights.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
