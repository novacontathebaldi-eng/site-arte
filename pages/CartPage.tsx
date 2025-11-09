import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';
import { CartItem } from '../types';
import { ROUTES } from '../constants';
import { TrashIcon, PlusIcon, MinusIcon, VisaIcon, MastercardIcon, PaypalIcon } from '../components/ui/icons';

// Componente para um único item na lista do carrinho.
const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
  const { language, t } = useTranslation();
  const { updateItemQuantity, removeItem } = useCart();
  const { showToast } = useToast();

  const handleRemove = () => {
    removeItem(item.id);
    showToast(t('toast.itemRemoved'), 'info');
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }
    const quantity = Math.min(newQuantity, item.stock);
    updateItemQuantity(item.id, quantity);
  };

  const formattedPrice = new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(item.price);
  const formattedSubtotal = new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(item.price * item.quantity);

  return (
    <div className="flex items-center py-4 border-b">
      <Link to={`/product/${item.slug}`}>
        <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-md" />
      </Link>
      <div className="flex-grow ml-4">
        <Link to={`/product/${item.slug}`} className="font-semibold hover:text-secondary">{item.title}</Link>
        <p className="text-sm text-text-secondary">{formattedPrice}</p>
      </div>
      <div className="flex items-center space-x-3">
        <div className="flex items-center border rounded-md">
          <button onClick={() => handleQuantityChange(item.quantity - 1)} className="px-2 py-1"><MinusIcon className="w-4 h-4" /></button>
          <input type="text" value={item.quantity} readOnly className="w-10 text-center border-l border-r" />
          <button onClick={() => handleQuantityChange(item.quantity + 1)} className="px-2 py-1"><PlusIcon className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="w-24 text-right font-semibold">{formattedSubtotal}</div>
      <div className="w-16 text-right">
        <button onClick={handleRemove} className="text-red-500 hover:text-red-700">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Componente principal da Página do Carrinho.
const CartPage: React.FC = () => {
  const { state } = useCart();
  const { language, t } = useTranslation();

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Lógica de frete e impostos será adicionada depois.
  const shipping = 0;
  const total = subtotal + shipping;

  const formattedSubtotal = new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(subtotal);
  const formattedShipping = new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(shipping);
  const formattedTotal = new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(total);

  return (
    <div className="bg-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-heading font-bold mb-8">{t('cart.title')}</h1>

        {state.items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <p className="text-xl text-text-secondary mb-6">{t('cart.emptyMessage')}</p>
            <Link to={ROUTES.CATALOG} className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors">
              {t('cart.browseCatalog')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              {state.items.map(item => <CartItemRow key={item.id} item={item} />)}
            </div>
            
            <aside className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">{t('cart.summary')}</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formattedSubtotal}</span></div>
                        <div className="flex justify-between"><span>{t('cart.shipping')}</span><span>{formattedShipping}</span></div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>{t('cart.total')}</span><span>{formattedTotal}</span></div>
                    </div>
                    <Link to={ROUTES.CHECKOUT} className="mt-6 w-full block text-center bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors">
                        {t('cart.proceedToCheckout')}
                    </Link>
                    <Link to={ROUTES.CATALOG} className="mt-4 w-full block text-center text-primary font-semibold py-2">
                        {t('cart.continueShopping')}
                    </Link>
                     <div className="mt-6 border-t pt-4">
                        <p className="text-sm text-center text-text-secondary mb-2">Pagamentos seguros com:</p>
                        <div className="flex justify-center items-center space-x-2">
                            <VisaIcon className="h-10 w-10" />
                            <MastercardIcon className="h-10 w-10" />
                            <PaypalIcon className="h-10 w-10" />
                        </div>
                    </div>
                </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
