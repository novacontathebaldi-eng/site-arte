import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase/config';
import { useUIStore } from '../store/uiStore';

export const useAdmin = () => {
  const { user } = useAuthStore();
  const { toggleDashboard, openAuthModal } = useUIStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Double check Firestore for security (client-side UI only, server actions verify internally)
        const doc = await db.collection('users').doc(user.uid).get();
        const role = doc.data()?.role;
        
        if (role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Admin check failed", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  const verifyAccess = () => {
    if (!isAdmin && !loading) {
        alert("Acesso Negado. Esta área é restrita.");
        return false;
    }
    return true;
  };

  return { isAdmin, loading, verifyAccess };
};