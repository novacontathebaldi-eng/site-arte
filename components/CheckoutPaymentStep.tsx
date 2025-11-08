import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Input from './ui/Input';
import Button from './ui/Button';

interface CheckoutPaymentStepProps {
  onBack: () => void;
  onPaymentSubmit: () => void;
}

const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({ onBack, onPaymentSubmit }) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui aconteceria a validação e tokenização do cartão com o Stripe
    onPaymentSubmit();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('checkout.paymentInfo')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-lg bg-surface">
            <h3 className="font-semibold mb-2">{t('checkout.cardInfo')}</h3>
            <div className="space-y-4">
                {/* FIX: Removed 'label' prop from Input component and added an explicit <label> element. */}
                <div>
                    <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.cardholderName')}</label>
                    <Input id="cardholderName" name="cardholderName" required />
                </div>
                {/* Campos simulando Stripe Elements */}
                <div className="p-3 border rounded-md bg-white">
                    <label className="text-sm font-medium text-gray-700">{t('checkout.cardNumber')}</label>
                    <div className="mt-1">...</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-md bg-white">
                         <label className="text-sm font-medium text-gray-700">{t('checkout.expiryDate')}</label>
                         <div className="mt-1">MM / YY</div>
                    </div>
                    <div className="p-3 border rounded-md bg-white">
                         <label className="text-sm font-medium text-gray-700">{t('checkout.cvc')}</label>
                         <div className="mt-1">CVC</div>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center mt-8">
            <Button type="button" variant="secondary" onClick={onBack} className="w-auto">
                &larr; {t('checkout.stepAddress')}
            </Button>
            <Button type="submit" variant="primary" className="w-auto">
                {t('checkout.continueToReview')}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPaymentStep;
