import React from 'react';
import { Box, VStack, Text, HStack } from '@chakra-ui/react';
import { Card as CardComponent } from '@/components/Card';
import type { UserPlan } from '@/types/plan.types';

export interface ProfilePlanTabProps {
  currentPlan: UserPlan | null;
}

export const ProfilePlanTab: React.FC<ProfilePlanTabProps> = ({ currentPlan }) => (
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
            <Text color="gray.700">R$ {currentPlan.price.toFixed(2).replace('.', ',')}</Text>
          </HStack>
          <Box pt={2}>
            <Text fontSize="sm" color="gray.500">
              Para alterar seu plano, acesse a página de Planos no menu.
            </Text>
          </Box>
        </VStack>
      ) : (
        <Text color="gray.600">Nenhum plano ativo. Acesse a página de Planos para assinar.</Text>
      )}
    </VStack>
  </CardComponent>
);
