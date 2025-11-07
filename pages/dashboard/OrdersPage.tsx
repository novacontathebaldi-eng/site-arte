import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const OrdersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-4">{t('dashboard.orders')}</h1>
      <p className="text-text-secondary">
        A lista de seus pedidos aparecerá aqui em breve.
      </p>
    </div>
  );
};

export default OrdersPage;