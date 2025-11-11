import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Input from '@shared/components/ui/Input';
import Button from '@shared/components/ui/Button';

interface CheckoutPaymentStepProps {
  onBack: () => void;
  onPaymentSubmit: () => void;
}

const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({ onBack, onPaymentSubmit }) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Stripe card validation and tokenization would happen here
    onPaymentSubmit();
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('checkout.paymentInfo')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-lg bg-surface">
            <h3 className="font-semibold mb-2">{t('checkout.cardInfo')}</h3>
            <div className="space-y-4">
                <Input id="cardholderName" name="cardholderName" label={t('checkout.cardholderName')} required />
                {/* Simulated Stripe Elements fields */}
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