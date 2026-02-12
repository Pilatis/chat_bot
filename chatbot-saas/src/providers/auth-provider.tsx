'use client';

import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/auth-context';
import { AuthContextType, LoginData, RegisterData, User, type AuthResult } from '../types/auth.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showSuccess, showError } = useToast();

  const isAuthenticated = !!user;

  // Verificar se há token salvo e carregar dados do usuário
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          if (response.data?.success && response.data?.data) {
            setUser(response.data.data);
          } else {
            // Token inválido, limpar storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          // Erro ao carregar perfil, limpar storage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
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

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        showSuccess(response.data?.message || 'Login realizado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro no login';
      showError(msg);
      setError(msg);
      return 'failure';
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

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        showSuccess(response.data?.message || 'Cadastro realizado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro no registro';
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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

  const clearError = (): void => {
    setError(null);
  };

  useEffect(() => {
    if (isAuthenticated && localStorage.getItem('accessToken')) {
      refreshUser();
    }
  }, [isAuthenticated, localStorage.getItem('accessToken')]);

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
