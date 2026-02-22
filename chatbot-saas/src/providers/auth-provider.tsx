'use client';

import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/auth-context';
import { AuthContextType, LoginData, RegisterData, User, UpdateProfileData, type AuthResult } from '../types/auth.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';
import { getLocalItem, setLocalItem, removeLocalItem } from '@/utils/storage';
import { getBackendMessage } from '@/utils/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showSuccess, showError } = useToast();

  const isAuthenticated = !!user;

  // Quando a API detecta 401 (token expirado), desloga e redireciona; este listener limpa o estado do usuário
  useEffect(() => {
    const onSessionExpired = () => {
      removeLocalItem('accessToken');
      removeLocalItem('refreshToken');
      setUser(null);
      setError(null);
    };
    window.addEventListener('auth:session-expired', onSessionExpired);
    return () => window.removeEventListener('auth:session-expired', onSessionExpired);
  }, []);

  // Verificar se há token salvo e carregar dados do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getLocalItem('accessToken');

      if (token) {
        try {
          const response = await api.get('/auth/profile');
          if (response.data?.success && response.data?.data) {
            setUser(response.data.data);
          } else {
            // Token inválido, limpar storage
            removeLocalItem('accessToken');
            removeLocalItem('refreshToken');
          }
        } catch (error) {
          // Erro ao carregar perfil, limpar storage
          removeLocalItem('accessToken');
          removeLocalItem('refreshToken');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, [api]);

  const login = async (data: LoginData): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/auth/login', data);

      if (response.data?.success && response.data?.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;

        setLocalItem('accessToken', accessToken);
        setLocalItem('refreshToken', refreshToken);
        setUser(userData);
        showSuccess(response.data?.message || 'Login realizado com sucesso');
        return 'success';
      } else {
          console.log('caiu aqui erro', response)
        const msg = getBackendMessage(response, 'Erro no login');
        showError(msg);
        setError(msg);
        return 'failure';
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro no login';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/auth/register', data);

      if (response.data?.success && response.data?.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;

        setLocalItem('accessToken', accessToken);
        setLocalItem('refreshToken', refreshToken);
        setUser(userData);
        showSuccess(response.data?.message || 'Cadastro realizado com sucesso');
        return 'success';
      }
      const msg = getBackendMessage(response, 'Erro no registro');
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro no registro';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Limpar tokens e dados do usuário
    removeLocalItem('accessToken');
    removeLocalItem('refreshToken');
    setUser(null);
    setError(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
      }
    } catch {
      showError('Sessão expirada. Faça login novamente.');
      logout();
    }
  };

  const updateProfile = async (data: UpdateProfileData): Promise<AuthResult> => {
    try {
      setError(null);
      const response = await api.put('/auth/profile', data);
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        showSuccess(response.data?.message || 'Perfil atualizado com sucesso');
        return 'success';
      }
      const msg = getBackendMessage(response, 'Erro ao atualizar perfil');
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao atualizar perfil';
      showError(msg);
      setError(msg);
      return 'failure';
    }
  };

  const clearError = (): void => {
    setError(null);
  };

  useEffect(() => {
    if (isAuthenticated && getLocalItem('accessToken')) {
      refreshUser();
    }
  }, [isAuthenticated]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
