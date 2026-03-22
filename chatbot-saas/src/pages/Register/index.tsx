'use client';

import React from 'react';
import { Flex } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterFormData } from '@/schemas/auth.schemas';
import { AUTH_ROUTES } from '@/config/authRoutes';
import { RegisterBrandPanel } from './components/RegisterBrandPanel';
import { RegisterFormPanel } from './components/RegisterFormPanel';

const initialValues: RegisterFormData = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export const Register: React.FC = () => {
  const { register, isLoading } = useAuth();
  const router = useRouter();

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
      router.replace(`${AUTH_ROUTES.verifyEmail}?email=${encodedEmail}`);
    }
  };

  return (
    <Flex minH="100vh">
      <RegisterBrandPanel />
      <RegisterFormPanel initialValues={initialValues} isLoading={isLoading} onSubmit={handleSubmit} />
    </Flex>
  );
};
