import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { seedDatabase } from '../../../lib/seed';
import { useToast } from '../../../hooks/useToast';
import { useI18n } from '../../../hooks/useI18n';
import { SettingsDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useRouter } from '../../../hooks/useRouter';

const SettingsPage: React.FC = () => {
    const { addToast } = useToast();
    const { t } = useI18n();
    const { navigate } = useRouter();
    const [settings, setSettings] = useState<Partial<SettingsDocument>>({ socialLinks: { instagram: '', facebook: '' } });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            const docRef = doc(db, 'settings', 'global');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

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

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const docRef = doc(db, 'settings', 'global');
            await setDoc(docRef, settings, { merge: true });
            addToast(t('admin.settings.settingsSaved'), "success");
        } catch (error: any) {
            addToast(error.message, "error");
        }
        setIsSaving(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...((prev as any)[parent] || {}),
                    [child]: value
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    }

    if(loading) return <div className="flex justify-center"><Spinner/></div>

    return (
        <div className="space-y-8">
            <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.title')}</h2>
                <div className="space-y-4">
                    <Input id="site-title" name="siteTitle" label={t('admin.settings.siteTitle')} value={settings.siteTitle || ''} onChange={handleChange} />
                    <Input id="contact-email" name="contactEmail" label={t('admin.settings.contactEmail')} type="email" value={settings.contactEmail || ''} onChange={handleChange}/>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode || false} onChange={handleChange} className="rounded"/>
                            <span>{t('admin.settings.maintenance')}</span>
                        </label>
                    </div>
                </div>
            </div>

             <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold font-serif mb-4">Social Media</h2>
                <div className="space-y-4">
                    <Input id="instagram" name="socialLinks.instagram" label="Instagram URL" value={settings.socialLinks?.instagram || ''} onChange={handleChange} />
                    <Input id="facebook" name="socialLinks.facebook" label="Facebook URL" value={settings.socialLinks?.facebook || ''} onChange={handleChange}/>
                </div>
            </div>
            
             <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold font-serif">{t('admin.settings.discounts')}</h2>
                    <Button variant="tertiary" onClick={() => navigate('/admin/settings/discounts')}>{t('admin.discounts.title')}</Button>
                 </div>
                 <p className="text-sm text-brand-black/70 dark:text-brand-white/70">Create and manage discount codes for promotions.</p>
            </div>

             <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                 <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.shipping')}</h2>
                 <p className="text-sm text-brand-black/70 dark:text-brand-white/70">Shipping region and pricing management UI would be here.</p>
            </div>


            <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold font-serif mb-4">{t('admin.settings.database')}</h2>
                <p className="text-sm text-brand-black/70 dark:text-brand-white/70 mb-4">{t('admin.settings.databaseWarning')}</p>
                <Button onClick={handleSeed} disabled={isSeeding} variant="secondary">
                    {isSeeding ? t('admin.settings.seeding') : t('admin.settings.seedButton')}
                </Button>
            </div>
            
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Spinner size="sm" color="border-white" />}
                    {t('admin.settings.save')}
                </Button>
            </div>
        </div>
    );
};

export default SettingsPage;
