'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiWifi, 
  FiWifiOff, 
  FiRefreshCw, 
  FiCheckCircle, 
  FiXCircle,
  FiAlertCircle 
} from 'react-icons/fi';
import { Card } from '../Card';
import { useWhatsApp } from '../../hooks/useWhatsApp';
import { useCompany } from '../../hooks/useCompany';
import { useToast } from '../../hooks/useToast';

export const WhatsAppConnection: React.FC = () => {
  const { company } = useCompany();
  const { 
    createSession, 
    getQRCode, 
    getSessionStatus,
    disconnectSession,
    qrCode, 
    currentSession, 
    isLoading, 
    isConnecting,
    error,
    clearError
  } = useWhatsApp();
  const { showSuccess, showError } = useToast();
  
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [isRefreshingQR, setIsRefreshingQR] = useState(false);

  // Verificar status do WhatsApp quando o componente montar
  useEffect(() => {
    const checkStatusOnMount = async () => {
      if (!company?.id) return;

      const sessionName = `company_${company.id}`;
      
      // Verificar se existe uma sessão no backend
      try {
        await getSessionStatus(sessionName);
        // O getSessionStatus já atualiza o estado automaticamente
        // Se a sessão está conectada, o estado será atualizado
        // Se está com QR_READY, pode mostrar o QR Code se necessário
      } catch (err) {
        // Sessão não existe, não fazer nada
      }
    };

    checkStatusOnMount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.id]);

  // Limpar intervalo ao desmontar
  useEffect(() => {
    return () => {
      if (statusCheckInterval !== null) {
        window.clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  const handleConnect = async () => {
    if (!company?.id) {
      showError('ID da empresa não encontrado', { title: 'Erro' });
      return;
    }

    try {
      clearError();
      const session = await createSession({
        companyId: company.id,
        sessionName: `company_${company.id}`
      });

      // Se não veio QR Code na resposta, buscar
      if (!session.qrCode && session.sessionName) {
        await getQRCode(session.sessionName);
      }

      // Iniciar verificação de status
      startStatusCheck(session.sessionName);
      
      showSuccess('Sessão criada! Escaneie o QR Code com seu WhatsApp.', {
        title: 'QR Code gerado'
      });
    } catch (err: any) {
      showError(err.message || 'Erro ao conectar WhatsApp', {
        title: 'Erro na conexão'
      });
    }
  };

  const handleRefreshQR = async () => {
    if (!currentSession?.sessionName) return;

    try {
      setIsRefreshingQR(true);
      clearError();
      await getQRCode(currentSession.sessionName);
      showSuccess('QR Code atualizado!', { title: 'Sucesso' });
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar QR Code', {
        title: 'Erro'
      });
    } finally {
      setIsRefreshingQR(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentSession?.sessionName) return;

    try {
      await disconnectSession(currentSession.sessionName);
      
      // Parar verificação de status
      if (statusCheckInterval !== null) {
        window.clearInterval(statusCheckInterval);
        setStatusCheckInterval(null);
      }
      
      showSuccess('WhatsApp desconectado com sucesso', {
        title: 'Desconectado'
      });
    } catch (err: any) {
      showError(err.message || 'Erro ao desconectar', {
        title: 'Erro'
      });
    }
  };

  const startStatusCheck = (sessionName: string) => {
    // Limpar intervalo anterior se existir
    if (statusCheckInterval !== null) {
      window.clearInterval(statusCheckInterval);
    }

    // Verificar status a cada 3 segundos
    const intervalId = window.setInterval(async () => {
      try {
        const status = await getSessionStatus(sessionName);
        
        if (status === 'CONNECTED') {
          // Parar verificação quando conectar
          window.clearInterval(intervalId);
          setStatusCheckInterval(null);
          showSuccess('WhatsApp conectado com sucesso!', {
            title: 'Conectado!'
          });
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    }, 3000);

    setStatusCheckInterval(intervalId);
  };

  const isConnected = currentSession?.isConnected || currentSession?.status === 'CONNECTED';
  const hasQRCode = !!qrCode;
  const showQRCode = hasQRCode && !isConnected;

  return (
    <Card>
      <VStack gap={6} align="stretch">
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="lg" fontWeight="semibold">
              Conexão WhatsApp
            </Text>
            {isConnected && (
              <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                <HStack gap={1}>
                  <FiCheckCircle />
                  <Text>Conectado</Text>
                </HStack>
              </Badge>
            )}
            {currentSession && !isConnected && (
              <Badge colorScheme="orange" px={3} py={1} borderRadius="full">
                <HStack gap={1}>
                  <FiWifiOff />
                  <Text>Desconectado</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Conecte seu WhatsApp para receber e enviar mensagens automaticamente
          </Text>
        </Box>

        {error && (
          <Box
            p={4}
            bg="red.50"
            border="1px"
            borderColor="red.200"
            borderRadius="md"
          >
            <HStack gap={2}>
              <FiAlertCircle color="#ef4444" />
              <Text color="red.700" fontSize="sm">{error}</Text>
            </HStack>
          </Box>
        )}

        {!currentSession && (
          <VStack gap={4}>
            <Box
              p={8}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              bg="gray.50"
              textAlign="center"
            >
              <VStack gap={3}>
                <FiWifiOff size={48} color="#9ca3af" />
                <Text color="gray.600" fontWeight="medium">
                  WhatsApp não conectado
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Clique no botão abaixo para gerar o QR Code e conectar
                </Text>
              </VStack>
            </Box>
            <Button
              onClick={handleConnect}
              colorScheme="green"
              size="lg"
              loading={isConnecting || isLoading}
              disabled={isConnecting || isLoading}
            >
              <HStack gap={2}>
                <FiWifi />
                <Text>Conectar WhatsApp</Text>
              </HStack>
            </Button>
          </VStack>
        )}

        {showQRCode && (
          <VStack gap={4}>
            <Box
              p={6}
              border="2px solid"
              borderColor="gray.200"
              borderRadius="md"
              bg="white"
              textAlign="center"
            >
              <VStack gap={4}>
                <Text fontWeight="medium" color="gray.700">
                  Escaneie este QR Code com seu WhatsApp
                </Text>
                <Box
                  p={4}
                  bg="white"
                  borderRadius="md"
                  border="1px"
                  borderColor="gray.200"
                  display="inline-block"
                >
                  <Image
                    src={qrCode && qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode || ''}`}
                    alt="QR Code WhatsApp"
                    maxW="300px"
                    maxH="300px"
                    w="300px"
                    h="300px"
                    objectFit="contain"
                  />
                </Box>
                <Text fontSize="xs" color="gray.500">
                  Abra o WhatsApp → Menu (⋮) → Dispositivos conectados → Conectar um dispositivo
                </Text>
              </VStack>
            </Box>

            <HStack gap={3} justify="center">
              <Button
                onClick={handleRefreshQR}
                variant="outline"
                size="md"
                loading={isRefreshingQR}
                disabled={isRefreshingQR}
              >
                <HStack gap={2}>
                  <FiRefreshCw />
                  <Text>Atualizar QR Code</Text>
                </HStack>
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                colorScheme="red"
                size="md"
                disabled={isLoading}
              >
                <HStack gap={2}>
                  <FiXCircle />
                  <Text>Cancelar</Text>
                </HStack>
              </Button>
            </HStack>

            {isConnecting && (
              <HStack gap={2} color="blue.600">
                <Spinner size="sm" />
                <Text fontSize="sm">Aguardando conexão...</Text>
              </HStack>
            )}
          </VStack>
        )}

        {isConnected && (
          <VStack gap={4}>
            <Box
              p={6}
              bg="green.50"
              border="2px solid"
              borderColor="green.200"
              borderRadius="md"
              textAlign="center"
            >
              <VStack gap={3}>
                <FiCheckCircle size={48} color="#16a34a" />
                <Text fontWeight="bold" color="green.700">
                  WhatsApp Conectado!
                </Text>
                <Text fontSize="sm" color="green.600">
                  Seu WhatsApp está conectado e pronto para receber mensagens
                </Text>
              </VStack>
            </Box>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              colorScheme="red"
              size="md"
              disabled={isLoading}
            >
              <HStack gap={2}>
                <FiXCircle />
                <Text>Desconectar WhatsApp</Text>
              </HStack>
            </Button>
          </VStack>
        )}

        {currentSession && !showQRCode && !isConnected && !isConnecting && (
          <VStack gap={4}>
            <Box
              p={6}
              bg="orange.50"
              border="2px solid"
              borderColor="orange.200"
              borderRadius="md"
              textAlign="center"
            >
              <VStack gap={3}>
                <FiAlertCircle size={48} color="#ea580c" />
                <Text fontWeight="bold" color="orange.700">
                  Aguardando conexão
                </Text>
                <Text fontSize="sm" color="orange.600">
                  Verificando status da conexão...
                </Text>
              </VStack>
            </Box>
            <HStack gap={3} justify="center">
              <Button
                onClick={handleRefreshQR}
                variant="outline"
                size="md"
                loading={isRefreshingQR}
                disabled={isRefreshingQR}
              >
                <HStack gap={2}>
                  <FiRefreshCw />
                  <Text>Gerar novo QR Code</Text>
                </HStack>
              </Button>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                colorScheme="red"
                size="md"
                disabled={isLoading}
              >
                <HStack gap={2}>
                  <FiXCircle />
                  <Text>Cancelar</Text>
                </HStack>
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Card>
  );
};

