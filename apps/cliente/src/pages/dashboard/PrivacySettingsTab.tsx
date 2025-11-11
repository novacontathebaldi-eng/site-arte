import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import Button from '@shared/components/ui/Button';
import { useToast } from '../../hooks/useToast';

const PrivacySettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const handleDownloadData = () => {
    // Logic to download user data will be implemented here.
    showToast('Functionality to download data will be implemented soon.', 'info');
  };

  const handleDeleteAccount = () => {
    // Account deletion logic will be implemented here.
    // Should include a confirmation modal.
    showToast('Functionality to delete account will be implemented soon.', 'info');
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-4">{t('dashboard.dataManagement')}</h2>
      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">{t('dashboard.downloadData')}</h3>
          <p className="text-sm text-text-secondary mt-1 mb-3">{t('dashboard.downloadDataDesc')}</p>
          <Button onClick={handleDownloadData} variant="secondary" className="w-auto">
            {t('dashboard.downloadData')}
          </Button>
        </div>
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg">
          <h3 className="font-semibold text-red-700">{t('dashboard.deleteAccount')}</h3>
          <p className="text-sm text-red-600 mt-1 mb-3">{t('dashboard.deleteAccountDesc')}</p>
          <p className="text-sm font-bold text-red-700">{t('dashboard.deleteAccountWarning')}</p>
          <Button onClick={handleDeleteAccount} className="w-auto mt-3 bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white">
            {t('dashboard.deleteAccount')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettingsTab;