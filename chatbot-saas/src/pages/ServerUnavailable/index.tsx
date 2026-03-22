'use client';

import React, { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { getSessionItem, removeSessionItem } from '@/utils/storage';
import { AUTH_ROUTES } from '@/config/authRoutes';
import { HEALTH_CHECK_TIMEOUT_MS, SESSION_LAST_ERROR_KEY, SESSION_RETURN_TO_KEY } from './constants';
import { ServerUnavailableActions } from './components/ServerUnavailableActions';

export const ServerUnavailable: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();
  const { showError, showSuccess } = useToast();

  const [isRetrying, setIsRetrying] = useState(false);
  const [returnTo, setReturnTo] = useState<string | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  useEffect(() => {
    setReturnTo(getSessionItem(SESSION_RETURN_TO_KEY));
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await axios.get(`${apiBaseUrl}/health`, { timeout: HEALTH_CHECK_TIMEOUT_MS });
      removeSessionItem(SESSION_LAST_ERROR_KEY);
      showSuccess('Conexão reestabelecida. Você já pode continuar.');
      router.replace(returnTo || '/dashboard');
    } catch {
      showError('Ainda não foi possível conectar no servidor. Tente novamente em instantes.', {
        title: 'Servidor ainda indisponível',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    router.back();
  };

  const handleExit = () => {
    logout();
    router.replace(AUTH_ROUTES.login);
  };

  return (
    <Box minH="100vh" bg="whiteLight" display="flex" alignItems="center" justifyContent="center" px={6} py={10}>
      <ServerUnavailableActions
        isRetrying={isRetrying}
        onRetry={handleRetry}
        onBack={handleBack}
        onExit={handleExit}
      />
    </Box>
  );
};
