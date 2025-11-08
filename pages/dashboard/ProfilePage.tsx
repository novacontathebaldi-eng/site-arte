import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Tenta pegar o display_name do perfil, senão do user_metadata, senão vazio
    // FIX: Property 'user_metadata' does not exist on type 'UserData'. Fallback to 'displayName' from Firebase User.
    setDisplayName(user?.profile?.display_name || user?.displayName || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Atualiza a tabela 'profiles' no Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        // FIX: Property 'id' does not exist on type 'UserData'. Use 'uid' instead.
        .eq('id', user.uid);

      if (profileError) throw profileError;
      
      // Atualiza os metadados no Supabase Auth para consistência
      const { error: userError } = await supabase.auth.updateUser({ data: { display_name: displayName } });
      if (userError) throw userError;

      await refetchUser();

      showToast(t('toast.profileUpdated'), 'success');
    } catch (error: any) {
      console.error("Error updating profile: ", error);
      showToast(error.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // FIX: Property 'created_at' does not exist on type 'UserData'. Use 'metadata.creationTime' from Firebase User.
  const creationDate = user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A';

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-primary mb-6">{t('dashboard.profile')}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">{t('dashboard.profileTitle')}</h2>
          {/* FIX: Removed 'label' prop from Input components and added explicit <label> elements. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
              <Input 
                id="displayName" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <Input 
                id="email" 
                value={user?.email || ''}
                disabled 
              />
            </div>
          </div>
        </div>
        
        <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">{t('dashboard.accountInfo')}</h2>
            <p className="text-sm text-text-secondary">{t('dashboard.memberSince')}: {creationDate}</p>
            {/* FIX: Property 'email_confirmed_at' does not exist on type 'UserData'. Use 'emailVerified' from Firebase User. */}
            <p className="text-sm text-text-secondary">{t('dashboard.emailVerified')}: {user?.emailVerified ? t('dashboard.yes') : t('dashboard.no')}</p>
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