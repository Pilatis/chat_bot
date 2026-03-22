import React from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';

export const AnalyticsLoading: React.FC = () => (
  <Box>
    <VStack gap={4} align="center" py={8}>
      <Spinner size="xl" />
      <Text color="gray.600">Carregando analytics...</Text>
    </VStack>
  </Box>
);
