import React from 'react';
import { Box, VStack, HStack, Text, IconButton } from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Card } from '@/components/Card';
import { Tooltip } from '@/components/ui/tooltip';
import type { Assistant } from '@/types/assistant.types';

export interface AssistantIdentityCardProps {
  assistant: Assistant;
  onEdit: () => void;
  onDelete: () => void;
}

export const AssistantIdentityCard: React.FC<AssistantIdentityCardProps> = ({
  assistant,
  onEdit,
  onDelete,
}) => (
  <Card id="tour-chatbot-assistant-card">
    <VStack gap={4} align="stretch">
      <HStack justify="space-between" align="center" w="full">
        <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
          Meu assistente
        </Text>
        <HStack gap={1}>
          <Tooltip content="Editar assistente" showArrow>
            <IconButton
              aria-label="Editar assistente"
              size="sm"
              variant="ghost"
              colorPalette="gray"
              onClick={onEdit}
            >
              <FiEdit2 />
            </IconButton>
          </Tooltip>
          <Tooltip content="Excluir assistente" showArrow>
            <IconButton
              aria-label="Excluir assistente"
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={onDelete}
            >
              <FiTrash2 />
            </IconButton>
          </Tooltip>
        </HStack>
      </HStack>
      <Box>
        <Text fontWeight="medium" color="gray.700">
          {assistant.name}
        </Text>
        {assistant.description && (
          <Text fontSize="sm" color="gray.600" mt={1}>
            {assistant.description}
          </Text>
        )}
      </Box>
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Número para conexão WhatsApp
        </Text>
        <Text fontSize="sm" color="gray.700">
          {assistant.whatsappNumber || '— Não informado'}
        </Text>
      </Box>
    </VStack>
  </Card>
);
