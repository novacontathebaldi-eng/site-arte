import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-16 text-center">
        <svg className="w-20 h-20 text-accent mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h1 className="text-4xl font-serif font-bold text-primary mb-2">{t('thank_you_for_order')}</h1>
        <p className="text-lg text-text-secondary mb-8">
            {t('order_number')}: <span className="font-semibold text-primary">{orderId}</span>
        </p>
        <p className="mb-8">You will receive an email confirmation shortly.</p>
        <Link to="/catalog" className="bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors">
            {t('continue_shopping')}
        </Link>
    </div>
  );
};

export default OrderConfirmationPage;
