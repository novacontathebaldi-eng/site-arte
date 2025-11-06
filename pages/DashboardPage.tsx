import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import Button from '../components/ui/Button';
import { auth } from '../lib/firebase';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();

    const handleLogout = () => {
        auth.signOut();
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-4">{t('auth.dashboardWelcome')}</h1>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <p><strong>{t('auth.fullName')}:</strong> {user?.displayName}</p>
                <p><strong>{t('auth.email')}:</strong> {user?.email}</p>
                <p className="mt-4">
                    Este é o seu painel. Em breve, você poderá ver seus pedidos, gerenciar seus endereços e muito mais aqui.
                </p>
                <Button onClick={handleLogout} variant="secondary" className="mt-6">
                    {t('auth.logout')}
                </Button>
            </div>
        </div>
    );
}

export default DashboardPage;