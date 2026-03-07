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
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';
import { ContextaLogo } from '../components/ContextaLogo';
import { PasswordInput } from '../components/PasswordInput';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import { cpfMask, phoneMask } from '../utils/masks';

export const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const bg = 'whiteLight';
  const cardBg = 'white';

  const initialValues: RegisterFormData = {
    name: '',
    email: '',
    cpf: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: RegisterFormData) => {
    const result = await register({
      name: values.name,
      email: values.email,
      cpf: values.cpf.replace(/\D/g, ''),
      phone: values.phone.replace(/\D/g, ''),
      password: values.password,
    });
    if (result === 'success') {
      const encodedEmail = encodeURIComponent(values.email);
      router.replace(`/verify-email?email=${encodedEmail}`);
    }
  };

  return (
    <Flex minH="100vh" bg={bg} align="center" justify="center" py={12} px={4}>
      <Box w="full" maxW="md" bg={cardBg} rounded="xl" shadow="lg" p={8}>
        <VStack gap={6}>
          <VStack gap={2} textAlign="center">
            <ContextaLogo size="lg" />
            <Text fontSize="h6" color="grayBold">
              Crie sua conta gratuita
            </Text>
          </VStack>

          <Box w="full">
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              validateOnChange
              validateOnBlur
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, values, setFieldValue }) => (
                <Form>
                  <VStack gap={4}>
                    <Field name="name">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <Input
                            {...field}
                            placeholder="Nome completo"
                            size="lg"
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>{meta.error}</Text>
                          )}
                        </Box>
                      )}
                    </Field>

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

                    <Field name="cpf">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <Input
                            {...field}
                            placeholder="CPF"
                            size="lg"
                            value={cpfMask(field.value || '')}
                            onChange={(e) => setFieldValue('cpf', cpfMask(e.target.value))}
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>{meta.error}</Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Field name="phone">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <Input
                            {...field}
                            placeholder="Telefone"
                            size="lg"
                            value={phoneMask(field.value || '')}
                            onChange={(e) => setFieldValue('phone', phoneMask(e.target.value))}
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>{meta.error}</Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Field name="password">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <PasswordInput
                            {...field}
                            placeholder="Senha"
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
                            placeholder="Confirmar senha"
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
                      color="white"
                      size="lg"
                      w="full"
                      loading={isLoading || isSubmitting}
                      loadingText="Criando conta..."
                      style={{ background: 'var(--gradient-primary)' }}
                      _hover={{ opacity: 0.95 }}
                    >
                      Criar conta
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
          </Box>

          <HStack>
            <Text color="grayBold">Já tem uma conta?</Text>
            <Link href="/login">
              <Box as="span" color="contexta.500" _hover={{ color: 'contexta.600' }}>
                Faça login
              </Box>
            </Link>
          </HStack>
        </VStack>
      </Box>
    </Flex>
  );
};
