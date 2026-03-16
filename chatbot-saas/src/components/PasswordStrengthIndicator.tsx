'use client';

import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { getStrength } from '../utils/get-strength';


interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { level, label, color } = getStrength(password);

  if (!password) return null;

  return (
    <Box w="full" mt={1.5}>
      <HStack gap={1}>
        {[1, 2, 3].map((i) => (
          <Box
            key={i}
            flex={1}
            h="4px"
            borderRadius="full"
            bg={i <= level ? color : 'gray.200'}
            transition="background 0.2s"
          />
        ))}
      </HStack>
      <Text fontSize="xs" color={color} mt={1}>
        {label}
      </Text>
    </Box>
  );
};
