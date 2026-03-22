import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/ui/empty-state';

export interface CompanyErrorProps {
  message?: string | null;
}

export const CompanyError: React.FC<CompanyErrorProps> = ({ message }) => (
  <Box>
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
          Configurações da Empresa
        </Text>
        <Text color="grayBold">Configure os dados da sua empresa para treinar o assistente</Text>
      </Box>
      <Card>
        <EmptyState
          title="Erro ao carregar dados"
          description={
            message || 'Não foi possível carregar as informações da empresa. Tente novamente.'
          }
          icon={<FiAlertCircle size={48} color="#ef4444" />}
        />
      </Card>
    </VStack>
  </Box>
);
