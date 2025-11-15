'use client';

import React, { useCallback } from 'react';
import { ApiContext } from '../context/api.context';
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiContextType } from '../types/api.types';

// Tipos para as respostas da API
interface ApiResponse<T = any> {
  data?: T;
  status: number;
  statusText?: string;
  errors?: any;
}

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  
  const apiClient: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    timeout: Infinity,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const apiClientFile: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    timeout: Infinity,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  // Adicionar interceptor para incluir automaticamente o token de acesso
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  apiClientFile.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  const setHeader = (name: string, value: string): void => {
    apiClient.defaults.headers.common[name] = value;
  };

  const setHeaderFile = (name: string, value: string): void => {
    apiClientFile.defaults.headers.common[name] = value;
  };

  const handleUnauthorized = async (originalRequest: () => Promise<AxiosResponse>): Promise<AxiosResponse> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        const response = await axios.post(`${apiBaseUrl}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        apiClientFile.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        return await originalRequest();
      } else {
        throw new Error('No refresh token');
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
     // window.location.href = '/login';
      throw new Error('Token refresh failed');
    }
  };

  const get = useCallback(async <T = any>(path: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const originalRequest = () => apiClient.get(path, { params });
      const response = await originalRequest();

      return { 
        data: response.data,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      // Se for erro 401, tenta refresh token
      if (axiosError.response?.status === 401) {
        try {
          const originalRequest = () => apiClient.get(path, { params });
          const response = await handleUnauthorized(originalRequest);
          
          return { 
            data: response.data,
            status: response.status,
            statusText: response.statusText
          };
        } catch (refreshError) {
          return {
            errors: 'Token refresh failed',
            status: 401
          };
        }
      }

      return {
        errors: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status || 500
      };
    }
  }, [apiClient]);

  const post = useCallback(async <T = any>(path: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const originalRequest = () => apiClient.post(path, params);
      const response = await originalRequest();

      return {
        data: response.data,
        status: response.status
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      // Se for erro 401, tenta refresh token
      if (axiosError.response?.status === 401) {
        try {
          const originalRequest = () => apiClient.post(path, params);
          const response = await handleUnauthorized(originalRequest);
          
          return {
            data: response.data,
            status: response.status
          };
        } catch (refreshError) {
          return {
            errors: 'Token refresh failed',
            status: 401
          };
        }
      }

      return {
        errors: axiosError.response?.data || axiosError.message,
        status: axiosError.response?.status || 500
      };
    }
  }, [apiClient]);

  const put = useCallback(
    async <T = any>(path: string, params?: any): Promise<ApiResponse<T>> => {
      try {
        const originalRequest = () => apiClient.put(path, params);
        const response = await originalRequest();

        return {
          data: response.data,
          status: response.status
        };
      } catch (error) {
        const axiosError = error as AxiosError;

        // Se for erro 401, tenta refresh token
        if (axiosError.response?.status === 401) {
          try {
            const originalRequest = () => apiClient.put(path, params);
            const response = await handleUnauthorized(originalRequest);
            
            return {
              data: response.data,
              status: response.status
            };
          } catch (refreshError) {
            return {
              errors: 'Token refresh failed',
              status: 401
            };
          }
        }

        return {
          errors: axiosError.response?.data || axiosError.message,
          status: axiosError.response?.status || 500
        };
      }
    }, [apiClient]);

  const deleted = useCallback(
    async <T = any>(path: string, params?: any): Promise<ApiResponse<T>> => {
      try {
        const originalRequest = () => apiClient.delete(path, params);
        const response = await originalRequest();

        return {
          data: response.data,
          status: response.status
        };
      } catch (error) {
        const axiosError = error as AxiosError;

        // Se for erro 401, tenta refresh token
        if (axiosError.response?.status === 401) {
          try {
            const originalRequest = () => apiClient.delete(path, params);
            const response = await handleUnauthorized(originalRequest);
            
            return {
              data: response.data,
              status: response.status
            };
          } catch (refreshError) {
            return {
              errors: 'Token refresh failed',
              status: 401
            };
          }
        }

        return {
          errors: axiosError.response?.data || axiosError.message,
          status: axiosError.response?.status || 500
        };
      }
    }, [apiClient]);

  const contextValue: ApiContextType = {
    api: { get, post, put, deleted, setHeader, setHeaderFile }
  };
  
  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
