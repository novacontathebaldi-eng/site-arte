import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const store = useAuthStore();

  useEffect(() => {
    // Initialize auth check on mount
    store.checkAuth();
  }, []);

  return store;
};
