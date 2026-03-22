import React from 'react';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { ServerUnavailableIllustration } from './ServerUnavailableIllustration';

export interface ServerUnavailableActionsProps {
  isRetrying: boolean;
  onRetry: () => void;
  onBack: () => void;
  onExit: () => void;
}

export const ServerUnavailableActions: React.FC<ServerUnavailableActionsProps> = ({
  isRetrying,
  onRetry,
  onBack,
  onExit,
}) => (
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
        <ServerUnavailableIllustration />
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
          onClick={onRetry}
          loading={isRetrying}
          loadingText="Testando conexão..."
        >
          Tentar novamente
        </Button>
        <Button variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button variant="ghost" color="gray.700" onClick={onExit}>
          Sair
        </Button>
      </HStack>
    </VStack>
  </Box>
);
