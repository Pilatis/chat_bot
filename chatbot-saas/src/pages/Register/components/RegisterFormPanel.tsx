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
  Link,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { Formik, Form } from 'formik';
import { registerSchema, RegisterFormData } from '@/schemas/auth.schemas';
import { ContextaLogo } from '@/components/ContextaLogo';
import { FormField } from '@/components/FormField';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { cpfMask, phoneMask } from '@/utils/masks';
import { AUTH_ROUTES } from '@/config/authRoutes';

export interface RegisterFormPanelProps {
  initialValues: RegisterFormData;
  isLoading: boolean;
  onSubmit: (values: RegisterFormData) => Promise<void>;
}

export const RegisterFormPanel: React.FC<RegisterFormPanelProps> = ({
  initialValues,
  isLoading,
  onSubmit,
}) => (
  <Flex
    w={{ base: '100%', lg: '55%' }}
    bg="white"
    align="center"
    justify="center"
    p={{ base: 6, md: 12 }}
    overflowY="auto"
  >
    <Box w="full" maxW="480px" className="fade-in" py={4}>
      <VStack gap={7} align="stretch">
        <VStack gap={2} textAlign="center">
          <Box display={{ base: 'block', lg: 'none' }} mb={2}>
            <ContextaLogo size="lg" />
          </Box>
          <Text fontSize="h3" fontWeight="600" color="defaultBlack">
            Crie sua conta
          </Text>
          <Text fontSize="h6" color="grayBold">
            Preencha os dados abaixo para começar
          </Text>
        </VStack>

        <Box w="full">
          <Formik
            initialValues={initialValues}
            validationSchema={registerSchema}
            onSubmit={onSubmit}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <Form>
                <VStack gap={4}>
                  <FormField name="name" label="Nome completo" placeholder="Seu nome" type="text" />

                  <FormField name="email" label="Email" placeholder="seu@email.com" type="email" />

                  <Flex gap={4} w="full" direction={{ base: 'column', md: 'row' }}>
                    <FormField
                      name="cpf"
                      label="CPF"
                      placeholder="000.000.000-00"
                      renderInput={(field, meta, { showError }) => (
                        <Input
                          {...field}
                          value={cpfMask(field.value || '')}
                          onChange={(e) => setFieldValue('cpf', cpfMask(e.target.value))}
                          size="lg"
                          bg="gray.50"
                          borderColor={showError ? 'red.500' : 'grayBorder'}
                          borderRadius="lg"
                        />
                      )}
                    />
                    <FormField
                      name="phone"
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      renderInput={(field, meta, { showError }) => (
                        <Input
                          {...field}
                          value={phoneMask(field.value || '')}
                          onChange={(e) => setFieldValue('phone', phoneMask(e.target.value))}
                          size="lg"
                          bg="gray.50"
                          borderColor={showError ? 'red.500' : 'grayBorder'}
                          borderRadius="lg"
                        />
                      )}
                    />
                  </Flex>

                  <FormField name="password" label="Senha" placeholder="Mínimo 8 caracteres" type="password">
                    <PasswordStrengthIndicator password={values.password} />
                  </FormField>

                  <FormField
                    name="confirmPassword"
                    label="Confirmar senha"
                    placeholder="Repita a senha"
                    type="password"
                  />

                  <Text fontSize="sm" color="gray.600" textAlign="center" w="full">
                    Ao criar conta você concorda com nossos{' '}
                    <Link
                      as={NextLink}
                      href={AUTH_ROUTES.termosDeUso}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="contexta.500"
                      fontWeight="600"
                      _hover={{ color: 'contexta.700', textDecoration: 'underline' }}
                    >
                      Termos de uso
                    </Link>
                    .
                  </Text>

                  <Button
                    type="submit"
                    color="white"
                    size="lg"
                    w="full"
                    h="48px"
                    fontSize="md"
                    fontWeight="600"
                    mt={2}
                    loading={isLoading || isSubmitting}
                    loadingText="Criando conta..."
                    style={{ background: 'var(--gradient-primary)' }}
                    _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                    _active={{ transform: 'translateY(0)' }}
                    borderRadius="lg"
                    boxShadow="0 4px 14px rgba(0, 168, 201, 0.3)"
                  >
                    Criar conta
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </Box>

        <HStack justify="center" gap={1.5}>
          <Text color="grayBold" fontSize="sm">
            Já tem uma conta?
          </Text>
          <Link as={NextLink} href={AUTH_ROUTES.login}>
            <Text
              as="span"
              color="contexta.500"
              fontWeight="600"
              fontSize="sm"
              _hover={{ color: 'contexta.700' }}
            >
              Faça login
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  </Flex>
);
