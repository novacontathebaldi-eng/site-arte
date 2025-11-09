import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import { CheckCircleIcon } from '../components/ui/icons';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-16">
      <div className="text-center bg-white p-10 rounded-lg shadow-lg max-w-lg w-full">
        <CheckCircleIcon className="w-16 h-16 mx-auto text-accent mb-4" />
        <h1 className="text-3xl font-heading font-bold text-primary mb-2">
          {t('orderConfirmation.title')}
        </h1>
        <p className="text-text-secondary mb-6">
          {t('orderConfirmation.message')}
        </p>
        <div className="bg-surface p-4 rounded-md inline-block">
          <span className="text-sm text-text-secondary">{t('orderConfirmation.orderNumber')}:</span>
          <p className="font-bold text-lg text-primary">{orderId}</p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to={ROUTES.CATALOG}
            className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors"
          >
            {t('orderConfirmation.continueShopping')}
          </Link>
          <Link
            to={ROUTES.DASHBOARD_ORDERS}
            className="bg-gray-200 text-text-primary font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('orderConfirmation.goToDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
