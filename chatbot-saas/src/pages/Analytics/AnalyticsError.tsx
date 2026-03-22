import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export interface AnalyticsErrorProps {
  message: string;
}

export const AnalyticsError: React.FC<AnalyticsErrorProps> = ({ message }) => (
  <Box>
    <Box p={4} bg="red.50" border="1px" borderColor="red.200" borderRadius="md" mb={4}>
      <Text color="red.700" fontWeight="medium">
        Erro: {message}
      </Text>
    </Box>
  </Box>
);
