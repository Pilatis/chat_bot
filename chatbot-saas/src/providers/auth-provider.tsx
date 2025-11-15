'use client';

import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/auth-context';
import { AuthContextType, LoginData, RegisterData, User } from '../types/auth.types';
import { useApi } from '../hooks/use-api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();

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

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/auth/login', data);
      
      if (response.data?.success && response.data?.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        // Salvar tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Salvar dados do usuário
        setUser(userData);
      } else {
        throw new Error(response.data?.message || 'Erro no login');
      }
    } catch (error: any) {
      setError(error.message || 'Erro no login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.post('/auth/register', data);
      
      if (response.data?.success && response.data?.data) {
        const { user: userData, accessToken, refreshToken } = response.data.data;
        
        // Salvar tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Salvar dados do usuário
        setUser(userData);
        return 'success';
      } else {
        throw new Error(response.data?.message || 'Erro no registro');
        return 'error';
      }
    } catch (error: any) {
      setError(error.message || 'Erro no registro');
      throw error;
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
    } catch (error) {
      // Se falhar ao carregar perfil, fazer logout
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
