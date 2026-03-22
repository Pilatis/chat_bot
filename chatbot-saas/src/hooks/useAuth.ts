import { useEffect, useContext } from 'react';
import { AuthContext } from '../context/auth-context';
import { AuthContextType } from '../types/auth.types';
import { AUTH_ROUTES } from '@/config/authRoutes';

// Hook para usar autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Hook para verificar se o usuário está autenticado
export const useRequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirecionar para login se não estiver autenticado
      window.location.href = AUTH_ROUTES.login;
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
};
