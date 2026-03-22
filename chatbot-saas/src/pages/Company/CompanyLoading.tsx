import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { Card } from '@/components/Card';

export const CompanyLoading: React.FC = () => (
  <Box>
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
          Configurações da Empresa
        </Text>
        <Text color="grayBold">Configure os dados da sua empresa para treinar o assistente</Text>
      </Box>
      <Card>
        <VStack gap={4} align="center" py={8}>
          <Text color="gray.600">Carregando dados da empresa...</Text>
        </VStack>
      </Card>
    </VStack>
  </Box>
);
