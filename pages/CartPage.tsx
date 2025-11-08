import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import { CartItem } from '../types';

const CartItemRow: React.FC<{ item: CartItem }> = ({ item }) => {
    const { getTranslated, t } = useTranslation();
    const { updateQuantity, removeFromCart } = useContext(CartContext)!;

    return (
        <div className="flex items-center py-4 border-b border-border-color">
            <Link to={`/product/${item.slug}`} className="w-24 h-24 mr-4">
                <img src={item.images[0].thumbnail} alt={getTranslated(item, 'title')} className="w-full h-full object-cover rounded-md" />
            </Link>
            <div className="flex-grow">
                <Link to={`/product/${item.slug}`} className="font-semibold text-primary hover:text-secondary">{getTranslated(item, 'title')}</Link>
                <p className="text-sm text-text-secondary">€{item.price.amount.toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:text-red-700 mt-1">{t('remove_item')}</button>
            </div>
            <div className="flex items-center space-x-2">
                 <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-16 text-center border border-border-color rounded-md"
                    aria-label={t('quantity')}
                 />
            </div>
             <div className="w-20 text-right font-semibold">
                €{(item.price.amount * item.quantity).toFixed(2)}
            </div>
        </div>
    );
};


const CartPage: React.FC = () => {
    const { t } = useTranslation();
    const { cart, itemCount, totalPrice } = useContext(CartContext)!;

    if (itemCount === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h1 className="text-4xl font-serif font-bold text-primary mb-4">{t('shopping_cart')}</h1>
                <p className="text-lg text-text-secondary mb-8">{t('your_cart_is_empty')}</p>
                <Link to="/catalog" className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors">
                    {t('browse_catalog')}
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <h1 className="text-4xl font-serif font-bold text-primary mb-8">{t('shopping_cart')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {cart.map(item => (
                        <CartItemRow key={item.id} item={item} />
                    ))}
                </div>
                <aside>
                    <div className="sticky top-24 bg-surface p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-serif font-semibold text-primary mb-4">{t('order_summary')}</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>{t('subtotal')}</span>
                                <span>€{totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('shipping')}</span>
                                <span className="text-sm text-text-secondary">{t('calculate_shipping')}</span>
                            </div>
                        </div>
                        <div className="border-t border-border-color my-4"></div>
                        <div className="flex justify-between font-bold text-lg">
                            <span>{t('total')}</span>
                            <span>€{totalPrice.toFixed(2)}</span>
                        </div>
                        <button className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-opacity-90 transition-colors">
                            {t('proceed_to_checkout')}
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CartPage;