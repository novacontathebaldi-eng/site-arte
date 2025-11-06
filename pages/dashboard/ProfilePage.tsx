import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { db, auth } from '../../lib/firebase';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ProfilePage: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Atualiza o formulário se os dados do usuário mudarem no contexto
    setDisplayName(user?.displayName || '');
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    
    setIsLoading(true);
    try {
      // Atualiza o perfil no Firebase Auth
      await updateProfile(auth.currentUser, { displayName });
      
      // Atualiza o documento no Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { displayName });
      
      // Força a recarga dos dados do usuário no contexto
      await refetchUser();

      showToast(t('toast.profileUpdated'), 'success');
    } catch (error) {
      console.error("Error updating profile: ", error);
      showToast(t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const creationDate = user?.createdAt?.toDate ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A';

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
            <p className="text-sm text-text-secondary">{t('dashboard.emailVerified')}: {auth.currentUser?.emailVerified ? t('dashboard.yes') : t('dashboard.no')}</p>
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