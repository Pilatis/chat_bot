import React, { useMemo, useState } from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

function ServerDownSvg() {
  return (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="24" y="22" width="172" height="116" rx="14" stroke="#D1D5DB" strokeWidth="3" fill="#FAFAFA" />
      <rect x="40" y="42" width="140" height="18" rx="6" fill="#E5E7EB" />
      <rect x="40" y="70" width="140" height="18" rx="6" fill="#E5E7EB" />
      <rect x="40" y="98" width="140" height="18" rx="6" fill="#E5E7EB" />
      <circle cx="58" cy="51" r="4" fill="#9CA3AF" />
      <circle cx="58" cy="79" r="4" fill="#9CA3AF" />
      <circle cx="58" cy="107" r="4" fill="#9CA3AF" />
      <path
        d="M156 146L196 166"
        stroke="#00A8C9"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M196 146L156 166"
        stroke="#00A8C9"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="176" cy="156" r="26" fill="#E6FAFC" stroke="#80E6F2" strokeWidth="2" />
    </svg>
  );
}

export const ServerUnavailable: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { showError, showSuccess } = useToast();

  const [isRetrying, setIsRetrying] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

  const returnTo = useMemo(() => {
    const fromState = (location.state as any)?.from as string | undefined;
    const fromStorage = sessionStorage.getItem('serverUnavailableReturnTo') || undefined;
    return fromState || fromStorage;
  }, [location.state]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await axios.get(`${apiBaseUrl}/health`, { timeout: 6000 });
      sessionStorage.removeItem('serverUnavailableLastError');
      showSuccess('Conexão reestabelecida. Você já pode continuar.');
      navigate(returnTo || '/dashboard', { replace: true });
    } catch (err: any) {
      showError('Ainda não foi possível conectar no servidor. Tente novamente em instantes.', {
        title: 'Servidor ainda indisponível'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBack = () => {
    if (returnTo) {
      navigate(returnTo);
      return;
    }
    navigate(-1);
  };

  const handleExit = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box minH="100vh" bg="whiteLight" display="flex" alignItems="center" justifyContent="center" px={6} py={10}>
      <Box
        w="full"
        maxW="640px"
        bg="white"
        border="1px"
        borderColor="grayBorder"
        borderRadius="2xl"
        p={{ base: 6, md: 10 }}
        shadow="lg"
      >
        <VStack gap={6} align="stretch">
          <HStack justify="center">
            <ServerDownSvg />
          </HStack>

          <VStack gap={2} textAlign="center">
            <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bold" color="defaultBlack">
              Servidor indisponível
            </Text>
            <Text color="gray.600">
              Não consegui completar suas requisições porque o backend parece estar fora do ar.
            </Text>
          </VStack>

          <HStack justify="center" gap={3} flexWrap="wrap">
            <Button
              color="white"
              style={{ background: 'var(--gradient-primary)' }}
              _hover={{ opacity: 0.95 }}
              onClick={handleRetry}
              loading={isRetrying}
              loadingText="Testando conexão..."
            >
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={handleBack}>
              Voltar
            </Button>
            <Button variant="ghost" color="gray.700" onClick={handleExit}>
              Sair
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

