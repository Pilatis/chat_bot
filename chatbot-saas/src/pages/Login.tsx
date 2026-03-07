'use client';

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Input,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field, FieldProps } from 'formik';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import { ContextaLogo } from '../components/ContextaLogo';
import { PasswordInput } from '../components/PasswordInput';

export const Login: React.FC = () => {
  const { login, isLoading, clearError } = useAuth();
  const router = useRouter();

  const bg = 'whiteLight';
  const cardBg = 'white';

  const initialValues: LoginFormData = {
    email: '',
    password: ''
  };

  const handleSubmit = async (values: LoginFormData) => {
    clearError();
    const result = await login(values);
    if (result === 'success') {
      router.replace('/dashboard');
    }
  };

  return (
    <Flex minH="100vh" bg={bg} align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg={cardBg} rounded="xl" shadow="lg" p={8}>
        <VStack gap={6}>
          <VStack gap={2} textAlign="center">
            <ContextaLogo size="xl" />
            <Text fontSize="h6" color="grayBold">
              Faça login para acessar sua conta
            </Text>
          </VStack>

          <Box w="full">
            <Formik
              initialValues={initialValues}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, submitCount }) => {
                const hasSubmitted = submitCount > 0;

                return (
                  <Form>
                    <VStack gap={4}>
                      <Field name="email">
                        {({ field, meta }: FieldProps) => {
                          const showError = hasSubmitted && meta.error;
                          return (
                            <Box w="full">
                              <Input
                                {...field}
                                placeholder="Email"
                                type="email"
                                size="lg"
                                borderColor={showError ? 'red.500' : undefined}
                              />
                              {showError && (
                                <Text color="red.500" fontSize="sm" mt={1}>
                                  {meta.error}
                                </Text>
                              )}
                            </Box>
                          );
                        }}
                      </Field>

                      <Field name="password">
                        {({ field, meta }: FieldProps) => {
                          const showError = hasSubmitted && meta.error;
                          return (
                            <Box w="full">
                              <PasswordInput
                                {...field}
                                placeholder="Senha"
                                borderColor={showError ? 'red.500' : undefined}
                              />
                              {showError && (
                                <Text color="red.500" fontSize="sm" mt={1}>
                                  {meta.error}
                                </Text>
                              )}
                            </Box>
                          );
                        }}
                      </Field>

                      <Box w="full" textAlign="right">
                        <Link href="/forgot-password">
                          <Text as="span" fontSize="sm" color="contexta.500" _hover={{ color: 'contexta.600' }}>
                            Esqueci minha senha
                          </Text>
                        </Link>
                      </Box>

                      <Button
                        type="submit"
                        color="white"
                        size="lg"
                        w="full"
                        loading={isLoading || isSubmitting}
                        loadingText="Entrando..."
                        style={{ background: 'var(--gradient-primary)' }}
                        _hover={{ opacity: 0.95 }}
                      >
                        Entrar
                      </Button>
                    </VStack>
                  </Form>
                );
              }}
            </Formik>
          </Box>

          <HStack>
            <Text color="grayBold">Ainda não tem conta?</Text>
            <Link href="/register">
              <Box as="span" color="contexta.500" _hover={{ color: 'contexta.600' }}>
                Cadastre-se
              </Box>
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};
