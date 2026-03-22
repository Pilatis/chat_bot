import React from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import { Card } from '@/components/Card';

export const ChatbotLoading: React.FC = () => (
  <Box>
    <VStack gap={8} align="stretch">
      <Box>
        <Text fontSize="2xl" fontWeight="bold" color="gray.700">
          Assistente
        </Text>
        <Text color="gray.600">Configure e teste seu assistente virtual</Text>
      </Box>
      <Card>
        <VStack gap={4} align="center" py={8}>
          <Text color="gray.600">Carregando...</Text>
        </VStack>
      </Card>
    </VStack>
  </Box>
);
