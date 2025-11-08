
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useCart } from '../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { CheckoutStep, AddressWithId } from '../types';
import { ROUTES } from '../constants';

import CheckoutStepper from '../components/CheckoutStepper';
import CheckoutAddressStep from '../components/CheckoutAddressStep';
import CheckoutPaymentStep from '../components/CheckoutPaymentStep';
import CheckoutReviewStep from '../components/CheckoutReviewStep';

const OrderSummary: React.FC = () => {
    const { t, language } = useTranslation();
    const { state } = useCart();

    const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 0; // Placeholder for shipping cost
    const total = subtotal + shipping;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-bold mb-4">{t('cart.summary')}</h2>
            <div className="space-y-2 text-sm max-h-60 overflow-y-auto pr-2">
                {state.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                        <span className="flex-1">{item.title} x {item.quantity}</span>
                        <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                 <div className="flex justify-between text-sm text-text-secondary">
                    <span>{t('cart.shipping')}</span>
                    <span>{formatCurrency(shipping)}</span>
                </div>
                 <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                    <span>{t('cart.total')}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        </div>
    );
};


const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { state: cartState } = useCart();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<AddressWithId | null>(null);

  useEffect(() => {
    if (cartState.items.length === 0) {
      navigate(ROUTES.CART, { replace: true });
    }
  }, [cartState.items, navigate]);

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

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
          {t('checkout.title')}
        </h1>

        <div className="max-w-4xl mx-auto mb-12">
            <CheckoutStepper currentStep={currentStep} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <main className="lg:col-span-2">
                {currentStep === 'address' && <CheckoutAddressStep onAddressSelect={handleAddressSelect} />}
                {currentStep === 'payment' && <CheckoutPaymentStep onBack={handleBackToAddress} onPaymentSubmit={handlePaymentSubmit} />}
                {currentStep === 'review' && selectedAddress && <CheckoutReviewStep selectedAddress={selectedAddress} onBack={handleBackToPayment} />}
            </main>

            <aside className="lg:col-span-1">
                <div className="sticky top-24">
                     <OrderSummary />
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
