import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { UserPreferences } from '@shared/types';
import ToggleSwitch from '@shared/components/ui/ToggleSwitch';
import Button from '@shared/components/ui/Button';

const NotificationsSettingsTab: React.FC = () => {
  const { user, updateUserPreferences } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    orderUpdates: true,
    promotions: false,
    newArtworks: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.profile?.preferences) {
      setPreferences(user.profile.preferences);
    }
  }, [user]);

  const handleToggle = (key: keyof UserPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
        await updateUserPreferences(preferences);
        showToast(t('toast.preferencesUpdated'), 'success');
    } catch (error) {
        console.error("Failed to update preferences:", error);
        showToast(t('toast.error'), 'error');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-4">{t('dashboard.emailNotifications')}</h2>
      <div className="space-y-4">
        <ToggleSwitch
          id="orderUpdates"
          label={t('dashboard.orderUpdates')}
          description={t('dashboard.orderUpdatesDesc')}
          checked={preferences.orderUpdates}
          onChange={() => handleToggle('orderUpdates')}
        />
        <ToggleSwitch
          id="promotions"
          label={t('dashboard.promotions')}
          description={t('dashboard.promotionsDesc')}
          checked={preferences.promotions}
          onChange={() => handleToggle('promotions')}
        />
        <ToggleSwitch
          id="newArtworks"
          label={t('dashboard.newArtworks')}
          description={t('dashboard.newArtworksDesc')}
          checked={preferences.newArtworks}
          onChange={() => handleToggle('newArtworks')}
        />
      </div>
      <div className="mt-6 flex justify-start">
        <Button onClick={handleSaveChanges} disabled={isLoading} className="w-auto">
          {isLoading ? t('dashboard.saving') : t('dashboard.saveChanges')}
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSettingsTab;