import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const DashboardHomePage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    
    // Mock data for now, will be replaced with real data from Firestore
    const stats = {
        totalOrders: 5,
        totalSpent: 1250.50,
        activeOrders: 1,
    };

    return (
        <div>
            <h1 className="text-3xl font-serif mb-2">{t('welcome_back')} {user?.displayName}!</h1>
            <p className="text-text-secondary mb-8">Here's a summary of your account activity.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-surface rounded-lg shadow-sm text-center">
                    <h2 className="text-4xl font-bold text-primary">{stats.totalOrders}</h2>
                    <p className="text-text-secondary mt-1">{t('total_orders')}</p>
                </div>
                <div className="p-6 bg-surface rounded-lg shadow-sm text-center">
                    <h2 className="text-4xl font-bold text-primary">€{stats.totalSpent.toFixed(2)}</h2>
                    <p className="text-text-secondary mt-1">{t('total_spent')}</p>
                </div>
                 <div className="p-6 bg-surface rounded-lg shadow-sm text-center">
                    <h2 className="text-4xl font-bold text-primary">{stats.activeOrders}</h2>
                    <p className="text-text-secondary mt-1">{t('active_orders')}</p>
                </div>
            </div>
            
             <div className="mt-12">
                <h2 className="text-2xl font-serif mb-4">Recent Orders</h2>
                <p>(Recent orders will be listed here)</p>
            </div>
        </div>
    );
};

export default DashboardHomePage;
