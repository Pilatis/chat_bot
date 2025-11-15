import React from 'react';
import { Box, HStack, Text, VStack } from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';

export const AITrainingAidMessage = () => {
  return (
    <Box
      p={4}
      bg="blue.50"
      border="1px"
      borderColor="blue.200"
      borderRadius="md"
      mb={4}
    >
      <VStack align="start" gap={2}>
        <HStack gap={2} align="center">
          <FiInfo color="#2563eb" />
          <Text fontSize="sm" fontWeight="medium" color="blue.700">
            Como funciona o treinamento da IA?
          </Text>
        </HStack>
        <VStack align="start" gap={1} pl={6}>
          <Text fontSize="xs" color="blue.600">
            <strong>1. Cadastre cada produto separadamente</strong> - Adicione
            todos os seus produtos/serviços um por um com nome, descrição e
            preço.
          </Text>
          <Text fontSize="xs" color="blue.600">
            <strong>2. Treinamento geral</strong> - Ao clicar em "Treinar IA", o
            sistema coleta TODOS os produtos cadastrados e faz um treinamento
            único com todas essas informações juntas.
          </Text>
          <Text fontSize="xs" color="blue.600">
            <strong>3. Respostas automáticas</strong> - Quando clientes
            perguntarem via WhatsApp sobre qualquer produto cadastrado, o
            chatbot responderá automaticamente com os detalhes, preços e
            características de qualquer um deles.
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};
