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

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getLocalItem('accessToken');

      if (token) {
        try {
          const response = await api.get('/auth/profile');
          if (response.data?.success && response.data?.data) {
            setUser(response.data.data);
          } else {
            removeLocalItem('accessToken');
            removeLocalItem('refreshToken');
          }
        } catch {
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

      if (response.data?.success) {
        showSuccess(response.data?.message || 'Conta criada! Verifique seu email.');
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

  const resendVerification = async (email: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/resend-verification', { email });
      if (response.data?.success) {
        showSuccess(response.data?.message || 'Email de verificação reenviado');
        return 'success';
      }
      const msg = getBackendMessage(response, 'Erro ao reenviar verificação');
      showError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao reenviar verificação';
      showError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/forgot-password', { email });
      if (response.data?.success) {
        showSuccess(response.data?.message || 'Link de redefinição enviado');
        return 'success';
      }
      const msg = getBackendMessage(response, 'Erro ao solicitar redefinição');
      showError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao solicitar redefinição';
      showError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<AuthResult> => {
    try {
      setIsLoading(true);
      const response = await api.post('/auth/reset-password', { token, password });
      if (response.data?.success) {
        showSuccess(response.data?.message || 'Senha redefinida com sucesso');
        return 'success';
      }
      const msg = getBackendMessage(response, 'Erro ao redefinir senha');
      showError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao redefinir senha';
      showError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
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
    resendVerification,
    forgotPassword,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
