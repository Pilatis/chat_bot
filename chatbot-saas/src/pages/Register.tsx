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
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';
import { ContextaLogo } from '../components/ContextaLogo';
import { FormField } from '../components/FormField';
import { PasswordStrengthIndicator } from '../components/PasswordStrengthIndicator';
import { cpfMask, phoneMask } from '../utils/masks';
import { FiCheckCircle, FiClock, FiShield } from 'react-icons/fi';

const features = [
  { icon: FiCheckCircle, text: 'Configure em poucos minutos' },
  { icon: FiClock, text: 'Teste grátis por 14 dias' },
  { icon: FiShield, text: 'Seus dados seguros e protegidos' },
];

export const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const router = useRouter();

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
    <Flex minH="100vh">
      {/* Brand Panel */}
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        w="45%"
        style={{ background: 'var(--gradient-secondary)' }}
        direction="column"
        align="center"
        justify="center"
        position="relative"
        overflow="hidden"
        p={12}
      >
        <Box
          className="auth-orb-1"
          position="absolute"
          top="-5%"
          right="-5%"
          w="350px"
          h="350px"
          borderRadius="full"
          style={{ background: 'radial-gradient(circle, rgba(0,168,201,0.12) 0%, transparent 70%)' }}
        />
        <Box
          className="auth-orb-2"
          position="absolute"
          bottom="-10%"
          left="-8%"
          w="450px"
          h="450px"
          borderRadius="full"
          style={{ background: 'radial-gradient(circle, rgba(0,153,255,0.1) 0%, transparent 70%)' }}
        />
        <Box
          className="auth-orb-3"
          position="absolute"
          top="35%"
          left="55%"
          w="250px"
          h="250px"
          borderRadius="full"
          style={{ background: 'radial-gradient(circle, rgba(0,168,201,0.08) 0%, transparent 70%)' }}
        />

        <VStack gap={10} position="relative" zIndex={1} maxW="380px">
          <VStack gap={4} textAlign="center">
            <Text
              fontSize="48px"
              fontWeight="700"
              className="gradient-text-primary"
              lineHeight="1.1"
            >
              Contexta
            </Text>
            <Text
              fontSize="lg"
              color="gray.400"
              fontWeight="300"
              lineHeight="1.7"
            >
              Comece a transformar seu atendimento ao cliente hoje mesmo
            </Text>
          </VStack>

          <Box
            w="60px"
            h="1px"
            style={{ background: 'var(--gradient-primary)' }}
            opacity={0.4}
          />

          <VStack gap={5} align="flex-start" w="full">
            {features.map((item, i) => (
              <HStack key={i} gap={4}>
                <Flex
                  w="44px"
                  h="44px"
                  minW="44px"
                  borderRadius="xl"
                  align="center"
                  justify="center"
                  style={{
                    background: 'rgba(0, 168, 201, 0.1)',
                    border: '1px solid rgba(0, 168, 201, 0.15)',
                  }}
                >
                  <item.icon size={18} color="#00A8C9" />
                </Flex>
                <Text color="gray.300" fontSize="sm" fontWeight="400">
                  {item.text}
                </Text>
              </HStack>
            ))}
          </VStack>
        </VStack>
      </Flex>

      {/* Form Panel */}
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
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({ isSubmitting, values, setFieldValue }) => (
                  <Form>
                    <VStack gap={4}>
                      <FormField
                        name="name"
                        label="Nome completo"
                        placeholder="Seu nome"
                        type="text"
                      />

                      <FormField
                        name="email"
                        label="Email"
                        placeholder="seu@email.com"
                        type="email"
                      />

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

                      <FormField
                        name="password"
                        label="Senha"
                        placeholder="Mínimo 8 caracteres"
                        type="password"
                      >
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
                          href="/termos-de-uso"
                          target="_blank"
                          rel="noopener noreferrer"
                          color="contexta.500"
                          fontWeight="600"
                          _hover={{ color: 'contexta.700', textDecoration: 'underline' }}
                        >
                          Termos de uso
                        </Link>.
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
              <Link as={NextLink} href="/login">
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
    </Flex>
  );
};
