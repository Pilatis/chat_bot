'use client';

import React, { useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Tabs,
  HStack,
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import { profileSchema, ProfileFormData } from '@/schemas/auth.schemas';
import { Card as CardComponent } from '@/components/Card';
import { phoneMask } from '@/utils/masks';

export default function PerfilPage() {
  const { user, updateProfile } = useAuth();
  const { currentPlan, getUserPlan } = usePlans();

  useEffect(() => {
    getUserPlan(false);
  }, []);

  const initialValues: ProfileFormData = {
    name: user?.name ?? '',
    phone: user?.phone ? String(user.phone).replace(/\D/g, '') : '',
  };

  const handleSubmit = async (values: ProfileFormData) => {
    const phoneDigits = values.phone?.replace(/\D/g, '').trim();
    await updateProfile({
      name: values.name.trim(),
      phone: phoneDigits ? phoneDigits : null,
    });
  };

  if (!user) {
    return (
      <Box>
        <Text>Carregando...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={8} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.800">
            Meu perfil
          </Text>
          <Text color="gray.600">
            Gerencie seus dados e visualize seu plano.
          </Text>
        </Box>

        <Tabs.Root defaultValue="perfil" variant="line" size="md">
          <Tabs.List>
            <Tabs.Trigger value="perfil">Perfil</Tabs.Trigger>
            <Tabs.Trigger value="plano">Plano</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="perfil">
            <CardComponent mt={6}>
              <Formik
                initialValues={initialValues}
                validationSchema={profileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {({ isSubmitting, values, setFieldValue }) => (
                  <Form>
                    <VStack gap={6} align="stretch">
                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Nome
                        </Text>
                        <Field name="name">
                          {({ field, meta }: FieldProps<string>) => (
                            <>
                              <Input
                                {...field}
                                placeholder="Seu nome"
                                size="md"
                               
                              />
                              {meta.touched && meta.error && (
                                <Text fontSize="sm" color="red.500" mt={1}>
                                  {meta.error}
                                </Text>
                              )}
                            </>
                          )}
                        </Field>
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="medium">
                          E-mail
                        </Text>
                        <Input
                          value={user.email}
                          size="md"
                          disabled
                          bg="gray.50"
                          _disabled={{ opacity: 1, cursor: 'not-allowed' }}
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          O e-mail não pode ser alterado aqui.
                        </Text>
                      </Box>

                      <Box>
                        <Text mb={2} fontWeight="medium">
                          Telefone
                        </Text>
                        <Field name="phone">
                          {({ field, meta }: FieldProps<string>) => (
                            <>
                              <Input
                                value={phoneMask(field.value || '')}
                                onChange={(e) =>
                                  setFieldValue(
                                    'phone',
                                    e.target.value.replace(/\D/g, '').slice(0, 11)
                                  )
                                }
                                onBlur={field.onBlur}
                                placeholder="(11) 99999-9999"
                                size="md"
                              
                              />
                              {meta.touched && meta.error && (
                                <Text fontSize="sm" color="red.500" mt={1}>
                                  {meta.error}
                                </Text>
                              )}
                            </>
                          )}
                        </Field>
                      </Box>

                      <Button
                        type="submit"
                        bg="contexta.500"
                        color="white"
                        _hover={{ bg: 'contexta.600' }}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        alignSelf="flex-start"
                      >
                        Salvar alterações
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </CardComponent>
          </Tabs.Content>

          <Tabs.Content value="plano">
            <CardComponent mt={6}>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold" color="gray.800">
                  Seu plano atual
                </Text>
                {currentPlan ? (
                  <VStack gap={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="medium" color="gray.700">
                        Plano
                      </Text>
                      <Text fontWeight="semibold" color="gray.800">
                        {currentPlan.name}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Mensagens incluídas</Text>
                      <Text color="gray.700">{currentPlan.limitMessages}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text color="gray.600">Valor</Text>
                      <Text color="gray.700">
                        R$ {currentPlan.price.toFixed(2).replace('.', ',')}
                      </Text>
                    </HStack>
                    <Box pt={2}>
                      <Text fontSize="sm" color="gray.500">
                        Para alterar seu plano, acesse a página de Planos no menu.
                      </Text>
                    </Box>
                  </VStack>
                ) : (
                  <Text color="gray.600">
                    Nenhum plano ativo. Acesse a página de Planos para assinar.
                  </Text>
                )}
              </VStack>
            </CardComponent>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
