import React from 'react';
import { Box, VStack, HStack, Text, Button, Badge } from '@chakra-ui/react';
import { Accordion } from '@chakra-ui/react';
import { FiEye, FiMessageSquare } from 'react-icons/fi';
import { EmptyState } from '@/components/ui/empty-state';
import type { MockConversation } from '../types';
import { getConversationStatusColor, getConversationStatusLabel } from '../utils';

export interface ConversationHistorySectionProps {
  conversations: MockConversation[];
  onViewConversation: (conversation: MockConversation) => void;
}

export const ConversationHistorySection: React.FC<ConversationHistorySectionProps> = ({
  conversations,
  onViewConversation,
}) => (
  <Accordion.Root collapsible defaultValue={[]}>
    <Accordion.Item
      value="historico-conversas"
      border="1px"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
      bg="white"
    >
      <Accordion.ItemTrigger _open={{ bg: 'gray.50' }}>
        <Box as="span" flex="1" textAlign="left">
          <HStack>
            <FiMessageSquare />
            <Text fontWeight="semibold">Histórico de conversas</Text>
            <Badge colorScheme="gray" fontSize="xs">
              {conversations.length} conversas
            </Badge>
          </HStack>
        </Box>
        <Accordion.ItemIndicator />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent>
        <Accordion.ItemBody pb={4}>
          <VStack gap={4} align="stretch">
            {conversations.length === 0 ? (
              <EmptyState
                title="Nenhuma conversa encontrada"
                description="Quando seus clientes enviarem mensagens via WhatsApp, elas aparecerão aqui"
                icon={<FiMessageSquare size={48} color="#9ca3af" />}
              />
            ) : (
              conversations.map((conversation) => (
                <Box
                  key={conversation.id}
                  p={4}
                  border="1px"
                  borderColor="gray.200"
                  borderRadius="md"
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={2}>
                      <Text fontWeight="medium">{conversation.customerName}</Text>
                      <Text fontSize="sm" color="gray.600" maxW="300px">
                        {conversation.lastMessage}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {conversation.timestamp.toLocaleDateString('pt-BR')}
                      </Text>
                    </VStack>
                    <VStack align="end" gap={2}>
                      <Badge colorScheme={getConversationStatusColor(conversation.status)}>
                        {getConversationStatusLabel(conversation.status)}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => onViewConversation(conversation)}>
                        <FiEye />
                        Ver Conversa
                      </Button>
                    </VStack>
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </Accordion.ItemBody>
      </Accordion.ItemContent>
    </Accordion.Item>
  </Accordion.Root>
);
