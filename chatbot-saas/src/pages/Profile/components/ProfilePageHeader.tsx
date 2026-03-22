import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export const ProfilePageHeader: React.FC = () => (
  <Box>
    <Text fontSize="2xl" fontWeight="bold" color="gray.800">
      Meu perfil
    </Text>
    <Text color="gray.600">Gerencie seus dados e visualize seu plano.</Text>
  </Box>
);
