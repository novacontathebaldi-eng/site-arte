
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useToast } from '../../hooks/useToast';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const SecuritySettingsTab: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (newPassword !== confirmPassword) {
      showToast(t('toast.passwordMismatch'), 'error');
      setIsLoading(false);
      return;
    }
    
     if (newPassword.length < 8) {
      showToast("Password should be at least 8 characters.", 'error');
      setIsLoading(false);
      return;
    }

    const user = auth.currentUser;
    if (!user || !user.email) {
        showToast('You must be logged in to change your password.', 'error');
        setIsLoading(false);
        return;
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      showToast(t('toast.passwordUpdated'), 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error("Password change error:", error);
      showToast(error.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text-primary mb-4">{t('dashboard.changePassword')}</h2>
      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
        <Input
          id="currentPassword"
          type="password"
          label={t('dashboard.currentPassword')}
          value={currentPassword}
          // FIX: Explicitly type event to correctly infer target type
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          id="newPassword"
          type="password"
          label={t('dashboard.newPassword')}
          value={newPassword}
          // FIX: Explicitly type event to correctly infer target type
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
          required
        />
        <Input
          id="confirmNewPassword"
          type="password"
          label={t('dashboard.confirmNewPassword')}
          value={confirmPassword}
          // FIX: Explicitly type event to correctly infer target type
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          required
        />
        <div className="pt-2">
            <Button type="submit" variant="primary" disabled={isLoading} className="w-auto">
                {isLoading ? t('dashboard.saving') : t('dashboard.updatePassword')}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettingsTab;