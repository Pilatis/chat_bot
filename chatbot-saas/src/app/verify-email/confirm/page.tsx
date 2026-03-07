'use client';

import React, { Suspense } from 'react';
import { Box, Flex, VStack, Text, Button } from '@chakra-ui/react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useSearchParams } from 'next/navigation';
import { ContextaLogo } from '../../../components/ContextaLogo';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const isSuccess = status === 'success';

  return (
    <Flex minH="100vh" bg="whiteLight" align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg="white" rounded="xl" shadow="lg" p={8}>
        <VStack gap={6} textAlign="center">
          <ContextaLogo size="lg" />

          <Box p={4}>
            {isSuccess ? (
              <FiCheckCircle size={64} color="var(--chakra-colors-green-500)" />
            ) : (
              <FiXCircle size={64} color="var(--chakra-colors-red-500)" />
            )}
          </Box>

          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold" color={isSuccess ? 'green.600' : 'red.600'}>
              {isSuccess ? 'Email confirmado!' : 'Falha na verificação'}
            </Text>
            <Text color="gray.600">
              {isSuccess
                ? 'Sua conta foi ativada com sucesso. Agora você pode fazer login.'
                : 'O link de verificação é inválido ou expirou. Solicite um novo link.'}
            </Text>
          </VStack>

          <VStack gap={3} w="full">
            {isSuccess ? (
              <Button as="a" href="/login" w="full" bg="contexta.500" color="white" _hover={{ bg: 'contexta.600' }}>
                Ir para o login
              </Button>
            ) : (
              <>
                <Button as="a" href="/verify-email" w="full" variant="outline" colorPalette="purple">
                  Solicitar novo link
                </Button>
                <Button as="a" href="/login" variant="ghost" colorPalette="gray" w="full">
                  Voltar para o login
                </Button>
              </>
            )}
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
}

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense fallback={
      <Flex minH="100vh" align="center" justify="center">
        <Text>Carregando...</Text>
      </Flex>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
