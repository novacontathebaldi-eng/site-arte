import React from 'react';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';

const AddressesPage: React.FC = () => {
    const { t } = useI18n();

    // In a real app, this data would come from a Firestore listener
    const addresses: any[] = [];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-serif font-bold">{t('dashboard.addresses.title')}</h1>
                 <Button>{t('dashboard.addresses.add')}</Button>
            </div>
           
            {addresses.length === 0 ? (
                <p>{t('dashboard.addresses.empty')}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Map over addresses here */}
                </div>
            )}
        </div>
    );
};

export default AddressesPage;