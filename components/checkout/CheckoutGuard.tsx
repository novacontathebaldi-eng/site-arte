import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import Spinner from '../common/Spinner';
import { useRouter } from '../../hooks/useRouter';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';

const CheckoutGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems } = useCart();
  const { navigate } = useRouter();
  const { t } = useI18n();

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black/5">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    // Redirect to home and maybe open login modal
    navigate('/');
    // You might want to trigger the login modal here
    return (
        <div className="flex justify-center items-center h-screen bg-brand-white">
            <div className="text-center p-8 bg-white shadow-lg rounded-md">
            <h1 className="text-2xl font-bold font-serif text-brand-black">{t('checkout.loginRequired')}</h1>
            <Button as="a" href="#" variant="primary" className="mt-6">
                Go to Homepage
            </Button>
            </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/catalog');
    return (
        <div className="flex justify-center items-center h-screen bg-brand-white">
            <div className="text-center p-8 bg-white shadow-lg rounded-md">
            <h1 className="text-2xl font-bold font-serif text-brand-black">{t('cart.empty')}</h1>
            <Button as="a" href="#/catalog" variant="primary" className="mt-6">
                {t('cart.browse')}
            </Button>
            </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CheckoutGuard;