import React, { useState } from 'react';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { seedDatabase } from '../../../lib/seed';
import { useToast } from '../../../hooks/useToast';
import { useI18n } from '../../../hooks/useI18n';

const SettingsPage: React.FC = () => {
    const { addToast } = useToast();
    const { t } = useI18n();
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        if (window.confirm(t('admin.settings.seedConfirm'))) {
            setIsSeeding(true);
            try {
                await seedDatabase();
                addToast(t('admin.settings.seedSuccess'), "success");
            } catch (error: any) {
                addToast(`${t('admin.settings.seedError')}: ${error.message}`, "error");
            } finally {
                setIsSeeding(false);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-brand-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.title')}</h2>
                <div className="space-y-4">
                    <Input id="site-title" label={t('admin.settings.siteTitle')} defaultValue="Meeh - Art by Melissa Pelussi" />
                    <Input id="contact-email" label={t('admin.settings.contactEmail')} type="email" defaultValue="hello@meeh.lu" />
                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" className="rounded"/>
                            <span>{t('admin.settings.maintenance')}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-brand-white p-6 rounded-lg shadow">
                 <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.discounts')}</h2>
                 <p className="text-sm text-brand-black/70">Discount code management UI would be here.</p>
            </div>

            <div className="bg-brand-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.database')}</h2>
                <p className="text-sm text-brand-black/70 mb-4">{t('admin.settings.databaseWarning')}</p>
                <Button onClick={handleSeed} disabled={isSeeding} variant="secondary">
                    {isSeeding ? t('admin.settings.seeding') : t('admin.settings.seedButton')}
                </Button>
            </div>
            
            <div className="flex justify-end">
                <Button>{t('admin.settings.save')}</Button>
            </div>
        </div>
    );
};

export default SettingsPage;
