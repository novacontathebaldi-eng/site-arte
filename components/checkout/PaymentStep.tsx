import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useI18n } from '../../hooks/useI18n';
import CreditCardIcon from '../icons/CreditCardIcon';
import PixIcon from '../icons/PixIcon';

interface PaymentStepProps {
  onSubmit: (paymentMethod: string) => void;
  onBack: () => void;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onSubmit, onBack }) => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const { t } = useI18n();

  return (
    <div className="bg-white dark:bg-brand-gray-800 p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold font-serif mb-6">{t('checkout.paymentMethod')}</h2>

      <div className="space-y-4">
        {/* Credit Card Option */}
        <label className={`flex items-start p-4 border dark:border-brand-gray-700 rounded-md cursor-pointer ${paymentMethod === 'creditCard' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
          <input type="radio" name="paymentMethod" value="creditCard" checked={paymentMethod === 'creditCard'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
          <div className="ml-4">
            <div className="flex items-center gap-2">
                <CreditCardIcon className="w-6 h-6"/>
                <span className="font-semibold">{t('checkout.creditCard')}</span>
            </div>
            {paymentMethod === 'creditCard' && (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-brand-black/70 dark:text-brand-white/70">
                    NOTE: This is a UI placeholder. In a real application, you would integrate a secure payment element from Revolut/Stripe here.
                    A secure backend function is required to create a payment intent and handle the transaction.
                </p>
                <Input id="card-number" label="Card Number" placeholder="**** **** **** 1234" />
                <div className="grid grid-cols-2 gap-4">
                    <Input id="card-expiry" label="Expiry Date" placeholder="MM / YY" />
                    <Input id="card-cvc" label="CVC" placeholder="123" />
                </div>
              </div>
            )}
          </div>
        </label>

        {/* PIX Option */}
        <label className={`flex items-start p-4 border dark:border-brand-gray-700 rounded-md cursor-pointer ${paymentMethod === 'pix' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
          <input type="radio" name="paymentMethod" value="pix" checked={paymentMethod === 'pix'} onChange={(e) => setPaymentMethod(e.target.value)} className="mt-1" />
          <div className="ml-4">
            <div className="flex items-center gap-2">
                <PixIcon className="w-6 h-6"/>
                <span className="font-semibold">{t('checkout.pix')}</span>
            </div>
             {paymentMethod === 'pix' && (
              <div className="mt-4 text-center">
                <p className="text-sm text-brand-black/70 dark:text-brand-white/70 mb-4">
                    {t('checkout.pixInstructions')}<br/>
                    <b>IMPORTANT:</b> To enable PIX, you need an API account with Banco Inter. A secure backend function must be created to generate the QR Code and "Copia e Cola" code. The credentials (client_id, client_secret, certificate) must be stored securely as environment variables in your backend.
                </p>
                <div className="p-4 border dark:border-brand-gray-700 rounded-md inline-block bg-white dark:bg-brand-gray-900">
                    <img src="https://picsum.photos/200" alt="QR Code Placeholder" className="w-48 h-48 mx-auto" />
                    <p className="text-xs font-mono break-all mt-2">00020126... (copia e cola placeholder)</p>
                </div>
              </div>
            )}
          </div>
        </label>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Button type="button" variant="tertiary" onClick={onBack}>Back</Button>
        <Button onClick={() => onSubmit(paymentMethod)}>Continue to Review</Button>
      </div>
    </div>
  );
};

export default PaymentStep;