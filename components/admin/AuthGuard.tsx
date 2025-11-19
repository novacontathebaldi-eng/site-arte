import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import Button from '../common/Button';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black/5">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || userDoc?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center h-screen bg-brand-white">
        <div className="text-center p-8 bg-white shadow-lg rounded-md">
          <h1 className="text-2xl font-bold font-serif text-brand-black">Access Denied</h1>
          <p className="mt-2 text-brand-black/70">You do not have permission to view this page.</p>
          <Button as="a" href="#" variant="primary" className="mt-6">
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
