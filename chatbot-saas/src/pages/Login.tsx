'use client';

import React from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';
import { ContextaLogo } from '../components/ContextaLogo';
import { FormField } from '../components/FormField';
import { FiMessageSquare, FiZap, FiBarChart2 } from 'react-icons/fi';
import { AUTH_ROUTES } from '@/config/authRoutes';

const features = [
  { icon: FiMessageSquare, text: 'Chatbots inteligentes e personalizáveis' },
  { icon: FiZap, text: 'Respostas instantâneas 24/7' },
  { icon: FiBarChart2, text: 'Analytics e insights em tempo real' },
];

export const Login: React.FC = () => {
  const { login, isLoading, clearError } = useAuth();
  const router = useRouter();

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
    <Flex minH="100vh">
      {/* Brand Panel */}
      <Flex
        display={{ base: 'none', lg: 'flex' }}
        w="50%"
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

        <VStack gap={10} position="relative" zIndex={1} maxW="400px">
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
              Automatize seu atendimento com inteligência artificial de última geração
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
        w={{ base: '100%', lg: '50%' }}
        bg="white"
        align="center"
        justify="center"
        p={{ base: 6, md: 12 }}
      >
        <Box w="full" maxW="420px" className="fade-in">
          <VStack gap={8} align="stretch">
            <VStack gap={3} textAlign="center">
              <Box display={{ base: 'block', lg: 'none' }} mb={2}>
                <ContextaLogo size="lg" />
              </Box>
              <Text fontSize="h3" fontWeight="600" color="defaultBlack">
                Bem-vindo de volta
              </Text>
              <Text fontSize="h6" color="grayBold">
                Faça login para acessar sua conta
              </Text>
            </VStack>

            <Box w="full">
              <Formik
                initialValues={initialValues}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <VStack gap={5}>
                      <FormField
                        name="email"
                        label="Email"
                        placeholder="seu@email.com"
                        type="email"
                      />

                      <FormField
                        name="password"
                        label="Senha"
                        placeholder="Digite sua senha"
                        type="password"
                      />

                      <Box w="full" textAlign="right">
                          <Link href={AUTH_ROUTES.forgotPassword}>
                            <Text
                              as="span"
                              fontSize="sm"
                              color="contexta.500"
                              fontWeight="500"
                              _hover={{ color: 'contexta.700' }}
                            >
                              Esqueci minha senha
                            </Text>
                          </Link>
                        </Box>

                        <Button
                          type="submit"
                          color="white"
                          size="lg"
                          w="full"
                          h="48px"
                          fontSize="md"
                          fontWeight="600"
                          loading={isLoading || isSubmitting}
                          loadingText="Entrando..."
                          style={{ background: 'var(--gradient-primary)' }}
                          _hover={{ opacity: 0.9, transform: 'translateY(-1px)' }}
                          _active={{ transform: 'translateY(0)' }}
                          borderRadius="lg"
                          boxShadow="0 4px 14px rgba(0, 168, 201, 0.3)"
                        >
                          Entrar
                        </Button>
                      </VStack>
                    </Form>
                )}
              </Formik>
            </Box>

            <HStack justify="center" gap={1.5}>
              <Text color="grayBold" fontSize="sm">
                Ainda não tem conta?
              </Text>
              <Link href={AUTH_ROUTES.register}>
                <Text
                  as="span"
                  color="contexta.500"
                  fontWeight="600"
                  fontSize="sm"
                  _hover={{ color: 'contexta.700' }}
                >
                  Cadastre-se gratuitamente
                </Text>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
};
