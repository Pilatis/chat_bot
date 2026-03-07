'use client';

import React, { Suspense } from 'react';
import { Box, Flex, VStack, Text, Button } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form, Field, FieldProps } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import { resetPasswordSchema, ResetPasswordFormData } from '../../schemas/auth.schemas';
import { ContextaLogo } from '../../components/ContextaLogo';
import { PasswordInput } from '../../components/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/PasswordStrengthIndicator';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();

  const initialValues: ResetPasswordFormData = {
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: ResetPasswordFormData) => {
    if (!token) return;
    const result = await resetPassword(token, values.password);
    if (result === 'success') {
      router.replace('/login');
    }
  };

  if (!token) {
    return (
      <Flex minH="100vh" bg="whiteLight" align="center" justify="center" py={12} px={4}>
        <Box w="full" maxW="md" bg="white" rounded="xl" shadow="lg" p={8}>
          <VStack gap={4} textAlign="center">
            <ContextaLogo size="lg" />
            <Text fontSize="xl" fontWeight="bold" color="red.600">
              Link inválido
            </Text>
            <Text color="gray.600">
              O link de redefinição de senha é inválido ou expirou.
            </Text>
            <Button as="a" href="/forgot-password" variant="outline" colorPalette="purple">
              Solicitar novo link
            </Button>
          </VStack>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg="whiteLight" align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg="white" rounded="xl" shadow="lg" p={8}>
        <VStack gap={6}>
          <ContextaLogo size="lg" />

          <VStack gap={2} textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Redefinir senha
            </Text>
            <Text color="gray.600">
              Crie uma nova senha para sua conta.
            </Text>
          </VStack>

          <Box w="full">
            <Formik
              initialValues={initialValues}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values }) => (
                <Form>
                  <VStack gap={4}>
                    <Field name="password">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <PasswordInput
                            {...field}
                            placeholder="Nova senha"
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          <PasswordStrengthIndicator password={values.password} />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>{meta.error}</Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Field name="confirmPassword">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <PasswordInput
                            {...field}
                            placeholder="Confirmar nova senha"
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>{meta.error}</Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      w="full"
                      size="lg"
                      bg="contexta.500"
                      color="white"
                      _hover={{ bg: 'contexta.600' }}
                      loading={isLoading || isSubmitting}
                      loadingText="Redefinindo..."
                    >
                      Redefinir senha
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Flex minH="100vh" align="center" justify="center">
        <Text>Carregando...</Text>
      </Flex>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
