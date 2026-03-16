'use client';

import React, { useState, Suspense } from 'react';
import { Box, Flex, VStack, Text, Button } from '@chakra-ui/react';
import { FiMail } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { ContextaLogo } from '../../components/ContextaLogo';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams !== null ? searchParams.get('email') : '';
  const { resendVerification, isLoading } = useAuth();
  const [sent, setSent] = useState(false);
  const router = useRouter();
  
  const handleResend = async () => {
    if (!email) return;
    const result = await resendVerification(email);
    if (result === 'success') setSent(true);
  };

  return (
    <Flex minH="100vh" bg="whiteLight" align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg="white" rounded="xl" shadow="lg" p={8}>
        <VStack gap={6} textAlign="center">
          <ContextaLogo size="lg" />

          <Box bg="contexta.50" p={4} borderRadius="full">
            <FiMail size={48} color="var(--chakra-colors-contexta-500)" />
          </Box>

          <VStack gap={2}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Verifique seu email
            </Text>
            <Text color="gray.600">
              Enviamos um link de verificação para{' '}
              {email && <Text as="span" fontWeight="semibold">{email}</Text>}
              . Confira sua caixa de entrada e clique no link para ativar sua conta.
            </Text>
          </VStack>

          <VStack gap={3} w="full">
            <Button
              onClick={handleResend}
              variant="outline"
              colorPalette="purple"
              w="full"
              loading={isLoading}
              disabled={sent || !email}
            >
              {sent ? 'Email reenviado!' : 'Reenviar email de verificação'}
            </Button>

            <Button onClick={() => router.push('/login')} variant="ghost" colorPalette="gray" w="full">
              Voltar para o login
            </Button>
          </VStack>

          <Text fontSize="sm" color="gray.500">
            O link expira em 24 horas. Verifique também a pasta de spam.
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <Flex minH="100vh" align="center" justify="center">
        <Text>Carregando...</Text>
      </Flex>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
