'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { ApiContext } from '../context/api.context';
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiContextType } from '../types/api.types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '../hooks/useToast';
import { useUnauthorizedHandler } from '../hooks/useUnauthorizedHandler';
import { getLocalItem, setLocalItem, setSessionItem } from '@/utils/storage';
import { getApiErrorMessage, isLoginFailure401 } from '@/utils/api';

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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  const { showError } = useToast();

  const lastServerDownToastAtRef = useRef<number>(0);

  const serverUnavailablePath = '/server-unavailable';

  const isServerUnavailableError = useCallback((axiosError: AxiosError | any): boolean => {
    const status = axiosError?.response?.status as number | undefined;
    if (status && [502, 503, 504].includes(status)) return true;

    // Sem response geralmente é falha de rede/servidor fora
    const hasResponse = !!axiosError?.response;
    if (hasResponse) return false;

    const code = String(axiosError?.code ?? '');
    const message = String(axiosError?.message ?? '');

    // Axios/browser variam bastante:
    // - axios: "Network Error" / code "ERR_NETWORK"
    // - fetch: "Failed to fetch"
    // - Chrome DevTools: net::ERR_CONNECTION_REFUSED (às vezes aparece no message)
    const networkSignals = [
      'Network Error',
      'Failed to fetch',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NAME_NOT_RESOLVED',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT'
    ];

    const codeSignals = ['ERR_NETWORK', 'ECONNABORTED'];

    return (
      codeSignals.includes(code) ||
      networkSignals.some((s) => message.includes(s))
    );
  }, []);

  const handleServerUnavailable = useCallback((axiosError: AxiosError | any) => {
    try {
      const now = Date.now();
      if (now - lastServerDownToastAtRef.current > 5000) {
        lastServerDownToastAtRef.current = now;
        showError('Não foi possível conectar ao servidor. Tente novamente em instantes.', {
          title: 'Servidor indisponível'
        });
      }

      const returnTo = pathname ? `${pathname}${search}` : '';
      if (returnTo && returnTo !== serverUnavailablePath) {
        setSessionItem('serverUnavailableReturnTo', returnTo);
      }

      const code = String(axiosError?.code ?? '');
      const message = String(axiosError?.message ?? '');
      setSessionItem('serverUnavailableLastError', JSON.stringify({ code, message }));
    } catch {
    }

    if (pathname !== serverUnavailablePath) {
      router.replace(serverUnavailablePath);
    }
  }, [pathname, search, router, showError]);
  
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

  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getLocalItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  apiClientFile.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getLocalItem('accessToken');
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

  const { handleUnauthorized } = useUnauthorizedHandler({
    apiBaseUrl,
    apiClient,
    apiClientFile
  });

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

      if (isServerUnavailableError(axiosError)) {
        handleServerUnavailable(axiosError);
        return { errors: 'Servidor indisponível', status: 0 };
      }

      const status401 = axiosError.response?.status === 401;
      const body401 = axiosError.response?.data;
      if (status401 && isLoginFailure401(401, body401)) {
        return { errors: typeof body401 === 'object' ? body401 : { message: getApiErrorMessage(401, body401) }, status: 401 };
      }
      if (status401) {
        try {
          const originalRequest = () => apiClient.get(path, { params });
          const response = await handleUnauthorized(originalRequest);
          return { data: response.data, status: response.status, statusText: response.statusText };
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sessão expirada';
          return { errors: { message: msg }, status: 401 };
        }
      }

      const status = axiosError.response?.status ?? 500;
      const body = axiosError.response?.data ?? axiosError.message;
      const message = getApiErrorMessage(status, body);
      return { errors: typeof body === 'object' ? body : { message }, status };
    }
  }, [apiClient, handleServerUnavailable, isServerUnavailableError, handleUnauthorized]);

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

      if (isServerUnavailableError(axiosError)) {
        handleServerUnavailable(axiosError);
        return { errors: 'Servidor indisponível', status: 0 };
      }

      const status401 = axiosError.response?.status === 401;
      const body401 = axiosError.response?.data;
      if (status401 && isLoginFailure401(401, body401)) {
        return { errors: typeof body401 === 'object' ? body401 : { message: getApiErrorMessage(401, body401) }, status: 401 };
      }
      if (status401) {
        try {
          const originalRequest = () => apiClient.post(path, params);
          const response = await handleUnauthorized(originalRequest);
          return { data: response.data, status: response.status };
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Sessão expirada';
          return { errors: { message: msg }, status: 401 };
        }
      }

      const status = axiosError.response?.status ?? 500;
      const body = axiosError.response?.data ?? axiosError.message;
      const message = getApiErrorMessage(status, body);
      return { errors: typeof body === 'object' ? body : { message }, status };
    }
  }, [apiClient, handleServerUnavailable, isServerUnavailableError, handleUnauthorized]);

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

        if (isServerUnavailableError(axiosError)) {
          handleServerUnavailable(axiosError);
          return { errors: 'Servidor indisponível', status: 0 };
        }

        const status401 = axiosError.response?.status === 401;
        const body401 = axiosError.response?.data;
        if (status401 && isLoginFailure401(401, body401)) {
          return { errors: typeof body401 === 'object' ? body401 : { message: getApiErrorMessage(401, body401) }, status: 401 };
        }
        if (status401) {
          try {
            const originalRequest = () => apiClient.put(path, params);
            const response = await handleUnauthorized(originalRequest);
            return { data: response.data, status: response.status };
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Sessão expirada';
            return { errors: { message: msg }, status: 401 };
          }
        }

        const status = axiosError.response?.status ?? 500;
        const body = axiosError.response?.data ?? axiosError.message;
        return { errors: typeof body === 'object' ? body : { message: getApiErrorMessage(status, body) }, status };
      }
    }, [apiClient, handleServerUnavailable, isServerUnavailableError, handleUnauthorized]);

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

        if (isServerUnavailableError(axiosError)) {
          handleServerUnavailable(axiosError);
          return { errors: 'Servidor indisponível', status: 0 };
        }

        const status401 = axiosError.response?.status === 401;
        const body401 = axiosError.response?.data;
        if (status401 && isLoginFailure401(401, body401)) {
          return { errors: typeof body401 === 'object' ? body401 : { message: getApiErrorMessage(401, body401) }, status: 401 };
        }
        if (status401) {
          try {
            const originalRequest = () => apiClient.delete(path, params);
            const response = await handleUnauthorized(originalRequest);
            return { data: response.data, status: response.status };
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Sessão expirada';
            return { errors: { message: msg }, status: 401 };
          }
        }

        const status = axiosError.response?.status ?? 500;
        const body = axiosError.response?.data ?? axiosError.message;
        return { errors: typeof body === 'object' ? body : { message: getApiErrorMessage(status, body) }, status };
      }
    }, [apiClient, handleServerUnavailable, isServerUnavailableError, handleUnauthorized]);

  const contextValue: ApiContextType = useMemo(() => ({
    api: { get, post, put, deleted, setHeader, setHeaderFile }
  }), [deleted, get, post, put]);
  
  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>;
};
