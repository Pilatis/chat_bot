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
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, FieldProps } from 'formik';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { loginSchema, LoginFormData } from '../schemas/auth.schemas';

export const Login: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const bg = 'whiteLight';
  const cardBg = 'white';

  const initialValues: LoginFormData = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: LoginFormData) => {
    try {
      clearError();
      await login(values);
      
      showSuccess('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (err) {
      showError(error || 'Email ou senha incorretos', {
        title: 'Erro no login'
      });
    }
  };

  return (
    <Flex
      minH="100vh"
      bg={bg}
      align="center"
      justify="center"
      py={12}
      px={4}
    >
      <Box
        w="full"
        maxW="md"
        bg={cardBg}
        rounded="xl"
        shadow="lg"
        p={8}
      >
        <VStack gap={6}>
          <VStack gap={2} textAlign="center">
            <Text fontSize="h1" fontWeight="h1" color="primaryButton">
              Chatbot
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
                            <Text color="red.500" fontSize="sm" mt={1}>
                              {meta.error}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Field name="password">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <Input
                            {...field}
                            placeholder="Senha"
                            type="password"
                            size="lg"
                            borderColor={meta.touched && meta.error ? 'red.500' : undefined}
                          />
                          {meta.touched && meta.error && (
                            <Text color="red.500" fontSize="sm" mt={1}>
                              {meta.error}
                            </Text>
                          )}
                        </Box>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      bg="primaryButton"
                      color="white"
                      size="lg"
                      w="full"
                      loading={isLoading || isSubmitting}
                      loadingText="Entrando..."
                      _hover={{ bg: 'baseOrange' }}
                    >
                      Entrar
                    </Button>
                  </VStack>
                </Form>
              )}
            </Formik>
          </Box>

          <HStack>
            <Text color="grayBold">Ainda não tem conta?</Text>
            <Link as={RouterLink} href="/register" color="primaryButton">
              Cadastre-se
            </Link>
          </HStack>

          <Box
            p={4}
            bg="lightOrange"
            rounded="md"
            w="full"
            textAlign="center"
          >
            <Text fontSize="small" color="primaryButton">
              <strong>Demo:</strong> admin@botatende.com / 123456
            </Text>
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};
