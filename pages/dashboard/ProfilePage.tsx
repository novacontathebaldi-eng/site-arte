import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { auth } from '../../lib/firebase';
// FIX: Removed modular import 'updateProfile' from 'firebase/auth' which caused an error.
// The v8 compatibility API is used instead.

const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Tenta pegar o display_name do perfil, senão do user_metadata, senão vazio
    setDisplayName(user?.profile?.display_name || user?.user_metadata?.display_name || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    
    setIsLoading(true);
    try {
      // Atualiza a tabela 'profiles' no Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (profileError) throw profileError;
      
      // FIX: Switched to Firebase v8 compat API `auth.currentUser.updateProfile()` to resolve module export errors.
      // Atualiza o perfil no Firebase Auth para consistência
      await auth.currentUser.updateProfile({ displayName });

      await refetchUser();

      showToast(t('toast.profileUpdated'), 'success');
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      showToast(error.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const creationDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('dashboard.profile')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.profileTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              id="displayName" 
              label={t('auth.fullName')} 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input 
              id="email" 
              label={t('auth.email')} 
              value={user?.email || ''}
              disabled 
            />
          </div>
        </div>
        
        <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.accountInfo')}</h2>
            <p className="text-sm text-text-secondary">{t('dashboard.memberSince')}: {creationDate}</p>
            <p className="text-sm text-text-secondary">{t('dashboard.emailVerified')}: {user?.email_confirmed_at ? t('dashboard.yes') : t('dashboard.no')}</p>
        </div>

        <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={isLoading} className="w-auto">
                {isLoading ? t('dashboard.saving') : t('dashboard.saveChanges')}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;