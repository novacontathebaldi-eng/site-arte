import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-4">{t('dashboard.settings')}</h1>
      <p className="text-text-secondary">
        As configurações de segurança e notificações estarão disponíveis aqui.
      </p>
    </div>
  );
};

export default SettingsPage;