import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';
import { useTranslation } from '../hooks/useTranslation';

// Este componente é um "guardião" para as nossas rotas.
// Ele verifica se o usuário está logado antes de permitir o acesso a uma página.
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // 1. Se ainda estamos verificando a autenticação, mostramos uma tela de carregamento.
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>{t('auth.loading')}...</p>
        </div>
    );
  }

  // 2. Se a verificação terminou e NÃO há usuário logado:
  if (!user) {
    // Redirecionamos para a página de login.
    // O `state: { from: location }` é importante: ele "lembra" a página que o usuário
    // queria acessar, para que possamos mandá-lo de volta para lá depois do login.
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // 3. Se o usuário está logado, simplesmente mostramos a página que ele queria acessar.
  return <>{children}</>;
};

export default ProtectedRoute;