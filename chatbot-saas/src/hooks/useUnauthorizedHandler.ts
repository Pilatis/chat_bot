'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AxiosInstance, AxiosResponse } from 'axios';
import axios from 'axios';
import { useToast } from './useToast';
import { getLocalItem, setLocalItem, removeLocalItem } from '@/utils/storage';
import { getApiErrorMessage } from '@/utils/api';
import { AUTH_ROUTES } from '@/config/authRoutes';

const SESSION_EXPIRED_DEFAULT = 'Sessão expirada. Faça login novamente.';

export interface UseUnauthorizedHandlerParams {
  apiBaseUrl: string;
  apiClient: AxiosInstance;
  apiClientFile: AxiosInstance;
}

/**
 * Hook que centraliza a lógica de 401 (não autorizado) e sessão expirada:
 * - Tenta refresh token; se falhar, limpa tokens, dispara evento, exibe toast e redireciona ao login.
 * - Mensagens usam o retorno do backend quando existir, senão mensagem por status.
 */
export function useUnauthorizedHandler({
  apiBaseUrl,
  apiClient,
  apiClientFile
}: UseUnauthorizedHandlerParams) {
  const router = useRouter();
  const { showError } = useToast();

  const handleSessionExpired = useCallback(
    (message?: string) => {
      removeLocalItem('accessToken');
      removeLocalItem('refreshToken');
      window.dispatchEvent(new CustomEvent('auth:session-expired'));
      showError(message ?? SESSION_EXPIRED_DEFAULT, { title: 'Não autorizado' });
      router.replace(AUTH_ROUTES.login);
    },
    [router, showError]
  );

  const handleUnauthorized = useCallback(
    async (originalRequest: () => Promise<AxiosResponse>): Promise<AxiosResponse> => {
      const refreshToken = getLocalItem('refreshToken');
      if (!refreshToken) {
        handleSessionExpired();
        throw new Error(SESSION_EXPIRED_DEFAULT);
      }

      try {
        const base = apiBaseUrl.replace(/\/$/, '');
        const response = await axios.post(`${base}/auth/refresh-token`, { refreshToken });
        const data = response.data?.data ?? response.data;
        const accessToken = data?.accessToken;
        if (!accessToken) {
          handleSessionExpired();
          throw new Error(SESSION_EXPIRED_DEFAULT);
        }
        setLocalItem('accessToken', accessToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        apiClientFile.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return await originalRequest();
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status ?? 401;
        const body = (err as { response?: { data?: unknown } })?.response?.data;
        const message = getApiErrorMessage(status, body, SESSION_EXPIRED_DEFAULT);
        handleSessionExpired(message);
        throw new Error(message);
      }
    },
    [apiBaseUrl, apiClient, apiClientFile, handleSessionExpired]
  );

  return { handleSessionExpired, handleUnauthorized };
}
