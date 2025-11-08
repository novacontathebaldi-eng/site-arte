import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { UserData, UserPreferences } from '../types';

/**
 * Hook de autenticação real que consome o AuthContext.
 *
 * Este hook atua como uma ponte (Adapter Pattern) entre o novo sistema de autenticação
 * baseado em Context/Firebase e os componentes existentes que esperam a assinatura do
 * hook `useAuth` original. Ele extrai os dados do contexto e os retorna no formato
 * esperado, minimizando a necessidade de refatoração em toda a aplicação.
 */
export const useAuth = (): Omit<AuthContextType, 'state'> & { user: UserData | null; loading: boolean } => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  // Mapeia o estado do contexto para a estrutura do hook antigo
  return {
    user: context.state.user,
    loading: context.state.loading,
    login: context.login,
    googleLogin: context.googleLogin,
    register: context.register,
    logout: context.logout,
    forgotPassword: context.forgotPassword,
    refetchUser: context.refetchUser,
    updateUserPreferences: context.updateUserPreferences,
  };
};