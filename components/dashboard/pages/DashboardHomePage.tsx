import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useI18n } from '../../../hooks/useI18n';

const DashboardHomePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useI18n();

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold">
                {t('dashboard.welcome')} {user?.displayName || user?.email}
            </h1>
            <p className="mt-2 text-brand-black/70">
                From your dashboard, you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
            </p>
        </div>
    );
};

export default DashboardHomePage;