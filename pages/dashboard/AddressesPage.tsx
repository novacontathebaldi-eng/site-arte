import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const AddressesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-4">{t('dashboard.addresses')}</h1>
      <p className="text-text-secondary">
        Aqui você poderá gerenciar seus endereços de entrega.
      </p>
    </div>
  );
};

export default AddressesPage;