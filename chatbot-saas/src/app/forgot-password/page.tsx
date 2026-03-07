'use client';

import React, { useState } from 'react';
import { Box, Flex, VStack, Text, Input, Button } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { Formik, Form, Field, FieldProps } from 'formik';
import { useAuth } from '../../hooks/useAuth';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../../schemas/auth.schemas';
import { ContextaLogo } from '../../components/ContextaLogo';

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth();
  const [sent, setSent] = useState(false);

  const initialValues: ForgotPasswordFormData = { email: '' };

  const handleSubmit = async (values: ForgotPasswordFormData) => {
    const result = await forgotPassword(values.email);
    if (result === 'success') setSent(true);
  };

  return (
    <Flex minH="100vh" bg="whiteLight" align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg="white" rounded="xl" shadow="lg" p={8}>
        <VStack gap={6}>
          <ContextaLogo size="lg" />

          <VStack gap={2} textAlign="center">
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Esqueceu sua senha?
            </Text>
            <Text color="gray.600">
              {sent
                ? 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
                : 'Informe seu email e enviaremos um link para redefinir sua senha.'}
            </Text>
          </VStack>

          {!sent ? (
            <Box w="full">
              <Formik
                initialValues={initialValues}
                validationSchema={forgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <VStack gap={4}>
                      <Field name="email">
                        {({ field, meta }: FieldProps) => (
                          <Box w="full">
                            <Input
                              {...field}
                              placeholder="Email"
                              type="email"
                              size="lg"
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
                        loadingText="Enviando..."
                      >
                        Enviar link de recuperação
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Box>
          ) : (
            <Button
              onClick={() => setSent(false)}
              variant="outline"
              colorPalette="purple"
              w="full"
            >
              Enviar novamente
            </Button>
          )}

          <Link href="/login">
            <Box as="span" display="flex" alignItems="center" gap={2} color="contexta.500" fontSize="sm" _hover={{ color: 'contexta.600' }}>
              <FiArrowLeft /> Voltar para o login
            </Box>
          </Link>
        </VStack>
      </Box>
    </Flex>
  );
}
