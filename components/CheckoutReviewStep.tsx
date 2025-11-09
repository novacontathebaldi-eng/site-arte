
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { AddressWithId } from '../types';
import Button from './ui/Button';
import { placeOrder } from '../services/api';
import { ROUTES } from '../constants';

interface CheckoutReviewStepProps {
  selectedAddress: AddressWithId;
  onBack: () => void;
}

const CheckoutReviewStep: React.FC<CheckoutReviewStepProps> = ({ selectedAddress, onBack }) => {
  const { t, language } = useTranslation();
  const { state, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Adicionar frete/impostos depois

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const handlePlaceOrder = async () => {
      if (!user) return;
      setIsPlacingOrder(true);
      try {
          const { orderId } = await placeOrder(user.uid, state.items, selectedAddress, selectedAddress);
          clearCart();
          navigate(`${ROUTES.ORDER_CONFIRMATION}/${orderId}`);
      } catch (error) {
          console.error("Failed to place order:", error);
          // show toast error
      } finally {
          setIsPlacingOrder(false);
      }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('checkout.reviewOrder')}</h2>
      
      <div className="space-y-6">
        {/* Itens do Carrinho */}
        <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{t('cart.summary')}</h3>
            {state.items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm py-2 border-b last:border-b-0">
                    <div>
                        <p className="font-medium">{item.title} <span className="text-text-secondary">x {item.quantity}</span></p>
                    </div>
                    <p>{formatCurrency(item.price * item.quantity)}</p>
                </div>
            ))}
             <div className="flex justify-between font-bold text-lg pt-2 mt-2"><span>{t('cart.total')}</span><span>{formatCurrency(total)}</span></div>
        </div>

        {/* Endereço de Entrega */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">{t('checkout.shippingTo')}</h3>
              <div className="text-sm text-text-secondary mt-1">
                <p>{selectedAddress.name}</p>
                <p>{selectedAddress.line1}</p>
                <p>{selectedAddress.postalCode} {selectedAddress.city}</p>
              </div>
            </div>
            <button onClick={onBack} className="text-sm text-secondary font-semibold hover:underline">{t('checkout.change')}</button>
          </div>
        </div>
        
        {/* Método de Pagamento */}
        <div className="border rounded-lg p-4">
           <div className="flex justify-between items-start">
             <div>
                <h3 className="font-semibold">{t('checkout.paymentMethod')}</h3>
                <p className="text-sm text-text-secondary mt-1">Cartão de Crédito terminando em ****</p>
             </div>
             <button onClick={onBack} className="text-sm text-secondary font-semibold hover:underline">{t('checkout.change')}</button>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button type="button" variant="secondary" onClick={onBack} className="w-auto">
          &larr; {t('checkout.stepPayment')}
        </Button>
        <Button onClick={handlePlaceOrder} disabled={isPlacingOrder} className="w-auto">
          {isPlacingOrder ? `${t('auth.loading')}...` : t('checkout.placeOrder')}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutReviewStep;