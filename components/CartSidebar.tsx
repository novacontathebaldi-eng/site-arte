import React, { Fragment } from 'react';
import { useCart } from '../hooks/useCart';
import { useI18n } from '../hooks/useI18n';
import Button from './common/Button';
import Spinner from './common/Spinner';

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);


const CartSidebar: React.FC = () => {
  const { isCartOpen, toggleCart, cartItems, removeFromCart, updateQuantity, subtotal, loading } = useCart();
  const { t, language } = useI18n();

  return (
    <Fragment>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleCart}
      />
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-brand-white dark:bg-brand-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full text-brand-black dark:text-brand-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-serif font-bold">{t('cart.title')}</h2>
            <button onClick={toggleCart}><XIcon className="h-6 w-6" /></button>
          </div>

          {/* Items */}
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
                <Spinner />
            </div>
          ) : cartItems.length > 0 ? (
            <div className="flex-grow overflow-y-auto p-6">
              <ul className="divide-y divide-black/10 dark:divide-white/10">
                {cartItems.map(item => (
                  <li key={item.id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-black/10 dark:border-white/10">
                      <img src={item.images[0]?.thumbnailUrl || item.images[0]?.url} alt={item.translations[language]?.title} className="h-full w-full object-cover object-center" />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium">
                          <h3><a href={`#/product/${item.id}`}>{item.translations[language]?.title}</a></h3>
                          <p className="ml-4">€{(item.price.amount / 100).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        {item.stock > 1 ? (
                            <div className="flex items-center border border-black/10 dark:border-white/10 rounded-md">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="px-3 py-1 text-lg leading-none disabled:opacity-50 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                    disabled={item.quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    -
                                </button>
                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="px-3 py-1 text-lg leading-none disabled:opacity-50 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                                    disabled={item.quantity >= item.stock}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </button>
                            </div>
                        ) : (
                            <p className="text-brand-black/70 dark:text-brand-white/70">Qty: {item.quantity}</p>
                        )}
                        <button onClick={() => removeFromCart(item.id)} className="font-medium text-brand-black/60 dark:text-brand-white/60 hover:text-red-600 dark:hover:text-red-500 flex items-center gap-1 transition-colors">
                            <TrashIcon className="w-4 h-4"/> {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
              <p className="text-lg text-brand-black/70 dark:text-brand-white/70">{t('cart.empty')}</p>
              <Button as="a" href="#/catalog" variant="primary" className="mt-4" onClick={toggleCart}>{t('cart.browse')}</Button>
            </div>
          )}

          {/* Footer */}
          {!loading && cartItems.length > 0 && (
            <div className="border-t border-black/10 dark:border-white/10 py-6 px-6">
              <div className="flex justify-between text-base font-medium">
                <p>{t('cart.subtotal')}</p>
                <p>€{(subtotal / 100).toFixed(2)}</p>
              </div>
              <div className="mt-6">
                <Button as="a" href="#/checkout" size="lg" className="w-full" onClick={toggleCart}>{t('cart.checkout')}</Button>
              </div>
               <div className="mt-4 flex justify-center text-center text-sm text-brand-black/60 dark:text-brand-white/60">
                <p>
                  {t('cart.or')}{' '}
                  <button
                    type="button"
                    className="font-medium text-brand-gold hover:text-yellow-500"
                    onClick={toggleCart}
                  >
                    {t('cart.continueShopping')}
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default CartSidebar;