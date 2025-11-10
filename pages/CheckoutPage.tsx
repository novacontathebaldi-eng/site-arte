
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { CheckoutStep, AddressWithId } from '../types';
import CheckoutStepper from '../components/CheckoutStepper';
import CheckoutAddressStep from '../components/CheckoutAddressStep';
import CheckoutPaymentStep from '../components/CheckoutPaymentStep';
import CheckoutReviewStep from '../components/CheckoutReviewStep';
import { useCart } from '../hooks/useCart';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../constants';

const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { state: cartState } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<AddressWithId | null>(null);

  const handleAddressSelect = (address: AddressWithId) => {
    setSelectedAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = () => {
    setCurrentStep('review');
  };

  const handleBackToAddress = () => {
    setCurrentStep('address');
  };

  const handleBackToPayment = () => {
    setCurrentStep('payment');
  };

  // Se o carrinho estiver vazio, redireciona para a home.
  if (cartState.items.length === 0) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
          {t('checkout.title')}
        </h1>
        <div className="mb-8">
            <CheckoutStepper currentStep={currentStep} />
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {currentStep === 'address' && <CheckoutAddressStep onAddressSelect={handleAddressSelect} />}
          {currentStep === 'payment' && <CheckoutPaymentStep onBack={handleBackToAddress} onPaymentSubmit={handlePaymentSubmit} />}
          {currentStep === 'review' && selectedAddress && <CheckoutReviewStep selectedAddress={selectedAddress} onBack={handleBackToPayment} />}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
