import React from 'react';
import { Box, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { FiMessageSquare } from 'react-icons/fi';
import type { MockConversation } from '../types';

export interface ConversationDetailModalProps {
  conversation: MockConversation;
  onClose: () => void;
}

export const ConversationDetailModal: React.FC<ConversationDetailModalProps> = ({
  conversation,
  onClose,
}) => (
  <Box
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    bg="rgba(0,0,0,0.5)"
    zIndex={1000}
    display="flex"
    alignItems="center"
    justifyContent="center"
    p={4}
  >
    <Box bg="white" borderRadius="md" maxW="600px" w="full" maxH="80vh" overflow="hidden">
      <Box p={4} borderBottom="1px" borderColor="gray.200">
        <HStack justify="space-between">
          <HStack>
            <FiMessageSquare />
            <Text fontWeight="bold">Conversa com {conversation.customerName}</Text>
          </HStack>
          <Button size="sm" onClick={onClose}>
            Fechar
          </Button>
        </HStack>
      </Box>
      <Box p={4} maxH="400px" overflowY="auto">
        <VStack gap={4} align="stretch">
          {conversation.conversation.map((msg) => (
            <Box
              key={msg.id}
              alignSelf={msg.isFromBot ? 'flex-start' : 'flex-end'}
              maxW="80%"
              p={3}
              bg={msg.isFromBot ? 'gray.100' : 'contexta.500'}
              color={msg.isFromBot ? 'gray.800' : 'white'}
              borderRadius="lg"
            >
              <Text fontSize="sm">{msg.content}</Text>
              <Text fontSize="xs" color={msg.isFromBot ? 'gray.500' : 'gray.200'} mt={1}>
                {msg.timestamp.toLocaleString('pt-BR')}
              </Text>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  </Box>
);
