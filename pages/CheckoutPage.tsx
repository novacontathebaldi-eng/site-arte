import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CheckoutStep, AddressWithId } from '../types';
import CheckoutStepper from '../components/CheckoutStepper';
import CheckoutAddressStep from '../components/CheckoutAddressStep';
import CheckoutPaymentStep from '../components/CheckoutPaymentStep';
import CheckoutReviewStep from '../components/CheckoutReviewStep';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<AddressWithId | null>(null);

  const handleAddressSelect = (address: AddressWithId) => {
    setSelectedAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = () => {
    setCurrentStep('review');
  };
  
  const handleBack = () => {
    if (currentStep === 'payment') setCurrentStep('address');
    if (currentStep === 'review') setCurrentStep('payment');
  };

  return (
    <div className="bg-surface min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-heading font-bold text-center mb-8">{t('checkout.title')}</h1>
          
          <CheckoutStepper currentStep={currentStep} />
          
          <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
            {currentStep === 'address' && (
              <CheckoutAddressStep onAddressSelect={handleAddressSelect} />
            )}
            {currentStep === 'payment' && (
              <CheckoutPaymentStep onBack={handleBack} onPaymentSubmit={handlePaymentSubmit} />
            )}
            {currentStep === 'review' && selectedAddress && (
              <CheckoutReviewStep selectedAddress={selectedAddress} onBack={handleBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;