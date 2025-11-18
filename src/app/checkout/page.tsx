'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Check,
  ChevronRight,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Address } from '@/types';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormData {
  shippingAddress: Partial<Address>;
  billingAddress: Partial<Address>;
  sameAsShipping: boolean;
  paymentMethod: 'card' | 'paypal' | 'pix';
  notes: string;
  termsAccepted: boolean;
}

const CheckoutContent: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { cart, getTotal, clearCart } = useCartStore();
  const stripe = useStripe();
  const elements = useElements();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    shippingAddress: {
      recipientName: user?.displayName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      country: 'LU',
      addressLine1: '',
      city: '',
      postalCode: ''
    },
    billingAddress: {},
    sameAsShipping: true,
    paymentMethod: 'card',
    notes: '',
    termsAccepted: false
  });

  const steps = [
    { id: 1, title: t('shipping'), icon: Truck },
    { id: 2, title: t('payment'), icon: CreditCard },
    { id: 3, title: t('review'), icon: Shield }
  ];

  const shippingOptions = [
    { id: 'standard', name: t('standard-shipping'), price: 25, days: '5-7' },
    { id: 'express', name: t('express-shipping'), price: 45, days: '2-3' },
    { id: 'local', name: t('local-pickup'), price: 0, days: '1' }
  ];

  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

  const handleInputChange = (field: string, value: any, section: 'shipping' | 'billing' = 'shipping') => {
    if (section === 'shipping') {
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        billingAddress: {
          ...formData.billingAddress,
          [field]: value
        }
      });
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        const required = ['recipientName', 'email', 'phone', 'addressLine1', 'city', 'postalCode', 'country'];
        return required.every(field => formData.shippingAddress[field as keyof Address]);
      case 2:
        return formData.paymentMethod !== '';
      case 3:
        return formData.termsAccepted;
      default:
        return true;
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateStep(3)) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getTotal() + selectedShipping.price,
          currency: 'eur',
          metadata: {
            userId: user?.uid,
            items: cart.items.length
          }
        })
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements!.getElement(CardElement)!,
          billing_details: {
            name: formData.shippingAddress.recipientName,
            email: formData.shippingAddress.email,
            address: {
              line1: formData.shippingAddress.addressLine1,
              city: formData.shippingAddress.city,
              postal_code: formData.shippingAddress.postalCode,
              country: formData.shippingAddress.country
            }
          }
        }
      });

      if (result.error) {
        toast.error(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'succeeded') {
        // Create order
        const orderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cart.items,
            shippingAddress: formData.shippingAddress,
            billingAddress: formData.sameAsShipping ? formData.shippingAddress : formData.billingAddress,
            paymentMethod: formData.paymentMethod,
            shippingMethod: selectedShipping,
            paymentIntentId: result.paymentIntent.id,
            notes: formData.notes
          })
        });

        if (orderResponse.ok) {
          const { orderId } = await orderResponse.json();
          await clearCart();
          router.push(`/order-confirmation/${orderId}`);
        } else {
          toast.error('Failed to create order');
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred during checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('shipping-address')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('full-name')} *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.recipientName}
                  onChange={(e) => handleInputChange('recipientName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  value={formData.shippingAddress.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  value={formData.shippingAddress.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('country')} *
                </label>
                <select
                  value={formData.shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="LU">Luxembourg</option>
                  <option value="BE">Belgium</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="NL">Netherlands</option>
                  <option value="PT">Portugal</option>
                  <option value="BR">Brazil</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('address')} *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('city')} *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('postal-code')} *
                </label>
                <input
                  type="text"
                  value={formData.shippingAddress.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('shipping-method')}</h3>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 border rounded-md cursor-pointer transition-colors ${
                      selectedShipping.id === option.id
                        ? 'border-primary bg-primary bg-opacity-5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping.id === option.id}
                        onChange={() => setSelectedShipping(option)}
                        className="mr-3 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{option.name}</p>
                        <p className="text-sm text-gray-600">
                          {t('estimated-delivery')}: {option.days} {t('days')}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {option.price === 0 ? t('free') : `€${option.price}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('payment-method')}</h2>
            
            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                <span className="font-medium text-gray-900">{t('credit-card')}</span>
              </label>
              
              <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="paypal"
                  checked={formData.paymentMethod === 'paypal'}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="mr-3 text-primary focus:ring-primary"
                />
                <span className="font-medium text-gray-900">PayPal</span>
              </label>
              
              {formData.shippingAddress.country === 'BR' && (
                <label className="flex items-center p-4 border border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={formData.paymentMethod === 'pix'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <span className="font-medium text-gray-900">PIX</span>
                </label>
              )}
            </div>

            {formData.paymentMethod === 'card' && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">{t('card-details')}</h3>
                <div className="space-y-4">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                      },
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <Shield className="w-4 h-4 mr-2" />
                  {t('secure-payment-message')}
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('order-review')}</h2>
            
            {/* Order Items */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">{t('order-items')}</h3>
              <div className="space-y-3">
                {cart.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images[0]?.url || '/placeholder.jpg'}
                          alt={product.translations.fr.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.translations.fr.title}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900">
                        €{(product.price.amount * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-medium text-gray-900 mb-4">{t('shipping-address')}</h3>
              <div className="text-sm text-gray-600">
                <p>{formData.shippingAddress.recipientName}</p>
                <p>{formData.shippingAddress.addressLine1}</p>
                <p>{formData.shippingAddress.city}, {formData.shippingAddress.postalCode}</p>
                <p>{formData.shippingAddress.country}</p>
                <p>{formData.shippingAddress.email}</p>
                <p>{formData.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="text-sm text-gray-600">
                  <p>
                    {t('accept-terms')}{' '}
                    <a href="/terms-of-service" className="text-primary hover:underline">
                      {t('terms-of-service')}
                    </a>{' '}
                    {t('and')}{' '}
                    <a href="/privacy-policy" className="text-primary hover:underline">
                      {t('privacy-policy')}
                    </a>
                  </p>
                </div>
              </label>
            </div>

            {/* Order Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('order-notes')} ({t('optional')})
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t('special-instructions')}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('checkout')}
            </h1>
            <p className="text-gray-600">
              {t('complete-your-purchase')}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      currentStep >= step.id
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-primary' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('back')}
                  </button>
                  
                  {currentStep < 3 ? (
                    <button
                      onClick={handleNextStep}
                      disabled={!validateStep(currentStep)}
                      className="inline-flex items-center px-6 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('continue')}
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || !formData.termsAccepted}
                      className="inline-flex items-center px-8 py-3 bg-secondary text-gray-900 font-medium rounded-md hover:bg-secondary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('place-order')
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
                  {t('order-summary')}
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    
                    return (
                      <div key={item.productId} className="flex items-center space-x-3">
                        <img
                          src={product.images[0]?.url || '/placeholder.jpg'}
                          alt={product.translations.fr.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.translations.fr.title}
                          </p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          €{(product.price.amount * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span>€{getTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span>
                      {selectedShipping.price === 0
                        ? t('free')
                        : `€${selectedShipping.price.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('discount')}</span>
                      <span>-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('total')}</span>
                      <span className="text-primary">
                        €{(getTotal() + selectedShipping.price - discount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      <span>{t('secure-checkout')}</span>
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      <span>{t('insured-shipping')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}