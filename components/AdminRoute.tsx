import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>{t('auth.loading')}...</p>
      </div>
    );
  }

  // Se não estiver logado, redireciona para a página de login
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Se o usuário não for um admin, redireciona para o dashboard normal
  if (user.profile?.role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  // Se for admin, renderiza o conteúdo da rota
  return <>{children}</>;
};

export default AdminRoute;