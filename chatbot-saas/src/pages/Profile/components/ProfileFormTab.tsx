'use client';

import React from 'react';
import { Box, VStack, Text, Input, Button } from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import { profileSchema, ProfileFormData } from '@/schemas/auth.schemas';
import { Card as CardComponent } from '@/components/Card';
import { phoneMask } from '@/utils/masks';
import type { User } from '@/types/auth.types';

export interface ProfileFormTabProps {
  user: User;
  initialValues: ProfileFormData;
  onSubmit: (values: ProfileFormData) => Promise<void>;
}

export const ProfileFormTab: React.FC<ProfileFormTabProps> = ({
  user,
  initialValues,
  onSubmit,
}) => (
  <CardComponent mt={6}>
    <Formik
      initialValues={initialValues}
      validationSchema={profileSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <VStack gap={6} align="stretch">
            <Box>
              <Text mb={2} fontWeight="medium">
                Nome
              </Text>
              <Field name="name">
                {({ field, meta }: FieldProps<string>) => (
                  <>
                    <Input {...field} placeholder="Seu nome" size="md" />
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
                        setFieldValue('phone', e.target.value.replace(/\D/g, '').slice(0, 11))
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
);
