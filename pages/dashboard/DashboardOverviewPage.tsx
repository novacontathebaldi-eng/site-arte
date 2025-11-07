import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';

// Esta é a nova página principal do dashboard (`/dashboard`),
// que é renderizada dentro do `DashboardLayout`.
const DashboardOverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-4">
        {t('dashboard.overview')}
      </h1>
      <p className="text-text-secondary">
        Olá, {user?.displayName}! {t('auth.dashboardWelcome')}.
      </p>
    </div>
  );
};

export default DashboardOverviewPage;