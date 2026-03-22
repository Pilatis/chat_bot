import React from 'react';
import { Box, HStack, Text, Badge } from '@chakra-ui/react';

export interface ChatbotPageHeaderProps {
  isTrained: boolean;
}

export const ChatbotPageHeader: React.FC<ChatbotPageHeaderProps> = ({ isTrained }) => (
  <Box id="tour-chatbot-title">
    <HStack gap={4} align="center" flexWrap="wrap">
      <Text fontSize="2xl" fontWeight="bold" color="gray.700">
        Assistente
      </Text>
      <Badge colorScheme={isTrained ? 'green' : 'orange'} fontSize="sm" px={3} py={1} borderRadius="full">
        {isTrained ? 'Treinado' : 'Não treinado'}
      </Badge>
    </HStack>
    <Text color="gray.600" mt={1}>
      Configure a identidade, treine a IA com os dados da empresa e teste o simulador.
    </Text>
  </Box>
);
