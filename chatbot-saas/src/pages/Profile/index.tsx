'use client';

import React, { useEffect, useMemo } from 'react';
import { Box, VStack, Tabs } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import { usePlans } from '@/hooks/usePlans';
import type { ProfileFormData } from '@/schemas/auth.schemas';
import { ProfileLoading } from './ProfileLoading';
import { ProfilePageHeader } from './components/ProfilePageHeader';
import { ProfileFormTab } from './components/ProfileFormTab';
import { ProfilePlanTab } from './components/ProfilePlanTab';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { currentPlan, getUserPlan } = usePlans();

  useEffect(() => {
    getUserPlan(false);
  }, []);

  const initialValues: ProfileFormData = useMemo(
    () => ({
      name: user?.name ?? '',
      phone: user?.phone ? String(user.phone).replace(/\D/g, '') : '',
    }),
    [user]
  );

  const handleSubmit = async (values: ProfileFormData) => {
    const phoneDigits = values.phone?.replace(/\D/g, '').trim();
    await updateProfile({
      name: values.name.trim(),
      phone: phoneDigits ? phoneDigits : null,
    });
  };

  if (!user) {
    return <ProfileLoading />;
  }

  return (
    <Box>
      <VStack gap={8} align="stretch">
        <ProfilePageHeader />

        <Tabs.Root defaultValue="perfil" variant="line" size="md">
          <Tabs.List>
            <Tabs.Trigger value="perfil">Perfil</Tabs.Trigger>
            <Tabs.Trigger value="plano">Plano</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="perfil">
            <ProfileFormTab user={user} initialValues={initialValues} onSubmit={handleSubmit} />
          </Tabs.Content>

          <Tabs.Content value="plano">
            <ProfilePlanTab currentPlan={currentPlan} />
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}
