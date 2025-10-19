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
import { registerSchema, RegisterFormData } from '../schemas/auth.schemas';

export const Register: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const bg = 'whiteLight';
  const cardBg = 'white';

  const initialValues: RegisterFormData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: RegisterFormData) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      
      showSuccess('Redirecionando para configuração da empresa...', {
        title: 'Conta criada com sucesso!'
      });
      navigate('/company');
    } catch (err) {
      showError(error || 'Tente novamente', {
        title: 'Erro no cadastro'
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
              Botatende
            </Text>
            <Text fontSize="h6" color="grayBold">
              Crie sua conta gratuita
            </Text>
          </VStack>

          <Box w="full">
            <Formik
              initialValues={initialValues}
              validationSchema={registerSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
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
                            <Text color="red.500" fontSize="sm" mt={1}>
                              {meta.error}
                            </Text>
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

                    <Field name="confirmPassword">
                      {({ field, meta }: FieldProps) => (
                        <Box w="full">
                          <Input
                            {...field}
                            placeholder="Confirmar senha"
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
                      loadingText="Criando conta..."
                      _hover={{ bg: 'baseOrange' }}
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
            <Link as={RouterLink} href="/login" color="primaryButton">
              Faça login
            </Link>
          </HStack>

        </VStack>
      </Box>
    </Flex>
  );
};

