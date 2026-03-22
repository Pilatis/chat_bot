import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const CompanyPageHeader: React.FC = () => (
  <Box id="tour-company-title">
    <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
      Configurações da Empresa
    </Text>
    <Text color="grayBold">Configure os dados da sua empresa para treinar o assistente</Text>
  </Box>
);
