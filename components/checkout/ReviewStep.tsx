import React from 'react';
import { useCart } from '../../hooks/useCart';
import { Address } from '../../firebase-types';
import Button from '../common/Button';
import { useI18n } from '../../hooks/useI18n';
import Spinner from '../common/Spinner';

interface ReviewStepProps {
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  isProcessing: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ shippingAddress, billingAddress, paymentMethod, isProcessing, onSubmit, onBack }) => {
  const { cartItems, subtotal } = useCart();
  const { t, language } = useI18n();
  
  // Placeholder values
  const shippingCost = 500;
  const total = subtotal + shippingCost;
  
  const AddressDisplay: React.FC<{address: Address}> = ({ address }) => (
      <div className="text-sm text-brand-black/80 dark:text-brand-white/80">
          <p className="font-semibold">{address.recipientName}</p>
          <p>{address.addressLine1}</p>
          <p>{address.city}, {address.postalCode}</p>
          <p>{address.country}</p>
      </div>
  );

  return (
    <div className="bg-white dark:bg-brand-gray-800 p-8 rounded-lg shadow-md">
      <h2 className="text-xl font-bold font-serif mb-6">{t('checkout.orderSummary')}</h2>
      
      {/* Item List */}
      <div className="divide-y divide-black/10 dark:divide-white/10">
        {cartItems.map(item => (
            <div key={item.id} className="flex items-center py-4">
                <img src={item.images[0]?.thumbnailUrl || item.images[0]?.url} alt={item.translations[language]?.title} className="w-16 h-16 rounded object-cover"/>
                <div className="ml-4 flex-grow">
                    <p className="font-semibold">{item.translations[language]?.title}</p>
                    <p className="text-sm text-brand-black/60 dark:text-brand-white/60">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium">€{(item.price.amount * item.quantity / 100).toFixed(2)}</p>
            </div>
        ))}
      </div>

      {/* Pricing Summary */}
      <div className="mt-6 border-t dark:border-white/10 pt-6 space-y-2 text-sm">
          <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>€{(subtotal / 100).toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>€{(shippingCost / 100).toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-base border-t dark:border-white/10 pt-2 mt-2"><span>Total</span><span>€{(total / 100).toFixed(2)}</span></div>
      </div>

      {/* Address & Payment Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t dark:border-white/10 pt-6">
          <div>
              <h3 className="font-semibold mb-2">{t('checkout.shippingAddress')}</h3>
              <AddressDisplay address={shippingAddress} />
          </div>
          <div>
              <h3 className="font-semibold mb-2">{t('checkout.billingAddress')}</h3>
              <AddressDisplay address={billingAddress} />
          </div>
          <div>
              <h3 className="font-semibold mb-2">{t('checkout.paymentMethod')}</h3>
              <p className="text-sm text-brand-black/80 dark:text-brand-white/80">{paymentMethod === 'creditCard' ? t('checkout.creditCard') : t('checkout.pix')}</p>
          </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Button type="button" variant="tertiary" onClick={onBack} disabled={isProcessing}>Back</Button>
        <Button onClick={onSubmit} disabled={isProcessing}>
            {isProcessing && <Spinner size="sm" color="border-white" />}
            {isProcessing ? t('checkout.processing') : t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;