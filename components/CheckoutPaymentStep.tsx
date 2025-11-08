
import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Input from './ui/Input';
import Button from './ui/Button';

interface CheckoutPaymentStepProps {
  onBack: () => void;
  onPaymentSubmit: () => void;
}

const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({ onBack, onPaymentSubmit }) => {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui aconteceria a validação e tokenização do cartão com o Stripe
    onPaymentSubmit();
  };

  const renderCardForm = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">{t('checkout.cardholderName')}</label>
        <Input id="cardholderName" name="cardholderName" required />
      </div>
      {/* Campos simulando Stripe Elements */}
      <div className="p-3 border rounded-md bg-white">
        <label className="text-sm font-medium text-gray-700">{t('checkout.cardNumber')}</label>
        <div className="mt-1 text-gray-400">XXXX XXXX XXXX XXXX</div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border rounded-md bg-white">
          <label className="text-sm font-medium text-gray-700">{t('checkout.expiryDate')}</label>
          <div className="mt-1 text-gray-400">MM / YY</div>
        </div>
        <div className="p-3 border rounded-md bg-white">
          <label className="text-sm font-medium text-gray-700">{t('checkout.cvc')}</label>
          <div className="mt-1 text-gray-400">CVC</div>
        </div>
      </div>
    </div>
  );

  const renderPixContent = () => (
    <div className="text-center p-6 border rounded-lg bg-gray-50">
        <p className="mb-4">Para pagar com PIX, escaneie o QR Code abaixo:</p>
        <div className="w-48 h-48 bg-gray-300 mx-auto flex items-center justify-center rounded-md">
            <p className="text-gray-500">QR Code</p>
        </div>
        <p className="text-xs text-gray-500 mt-4">O código expira em 10 minutos.</p>
    </div>
  );

  const renderBoletoContent = () => (
    <div className="text-center p-6 border rounded-lg bg-gray-50">
        <p className="mb-4">Clique no botão para gerar seu boleto.</p>
        <Button variant="secondary" className="w-auto">Gerar Boleto</Button>
        <p className="text-xs text-gray-500 mt-4">O pagamento pode levar até 3 dias úteis para ser confirmado.</p>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('checkout.paymentInfo')}</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex border-b mb-6">
            <button type="button" onClick={() => setPaymentMethod('card')} className={`px-4 py-2 text-sm font-medium transition-colors ${paymentMethod === 'card' ? 'border-b-2 border-secondary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Cartão de Crédito</button>
            <button type="button" onClick={() => setPaymentMethod('pix')} className={`px-4 py-2 text-sm font-medium transition-colors ${paymentMethod === 'pix' ? 'border-b-2 border-secondary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>PIX</button>
            <button type="button" onClick={() => setPaymentMethod('boleto')} className={`px-4 py-2 text-sm font-medium transition-colors ${paymentMethod === 'boleto' ? 'border-b-2 border-secondary text-primary' : 'text-text-secondary hover:text-text-primary'}`}>Boleto</button>
        </div>

        <div className="p-4 border rounded-lg bg-surface">
          {paymentMethod === 'card' && renderCardForm()}
          {paymentMethod === 'pix' && renderPixContent()}
          {paymentMethod === 'boleto' && renderBoletoContent()}
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
