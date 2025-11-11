import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { LockClosedIcon, BellIcon, ShieldCheckIcon } from '@shared/components/ui/icons';
import SecuritySettingsTab from './SecuritySettingsTab';
import NotificationsSettingsTab from './NotificationsSettingsTab';
import PrivacySettingsTab from './PrivacySettingsTab';
import { useAuth } from '../../hooks/useAuth';

type Tab = 'security' | 'notifications' | 'privacy';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('security');

  const tabs = [
    { id: 'security', label: t('dashboard.settingsSecurity'), icon: LockClosedIcon },
    { id: 'notifications', label: t('dashboard.settingsNotifications'), icon: BellIcon },
    { id: 'privacy', label: t('dashboard.settingsPrivacy'), icon: ShieldCheckIcon },
  ];

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('dashboard.settings')}</h1>
      
      <div className="flex border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-secondary text-primary'
                : 'border-transparent text-text-secondary hover:border-gray-300 hover:text-text-primary'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'security' && <SecuritySettingsTab />}
        {activeTab === 'notifications' && <NotificationsSettingsTab />}
        {activeTab === 'privacy' && <PrivacySettingsTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
