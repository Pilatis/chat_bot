import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
} from '@chakra-ui/react';
import { FiEye, FiMessageSquare } from 'react-icons/fi';
import { Card } from '../components/Card';

const mockMessages = [
  {
    id: '1',
    customerName: 'João Silva',
    lastMessage: 'Olá, gostaria de saber sobre os preços',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'responded' as const,
    conversation: [
      { id: '1', content: 'Olá, gostaria de saber sobre os preços', isFromBot: false, timestamp: new Date('2024-01-15T10:30:00') },
      { id: '2', content: 'Olá João! Claro, posso ajudá-lo com informações sobre nossos preços. Qual produto você tem interesse?', isFromBot: true, timestamp: new Date('2024-01-15T10:31:00') },
      { id: '3', content: 'Estou interessado no plano básico', isFromBot: false, timestamp: new Date('2024-01-15T10:32:00') },
      { id: '4', content: 'Perfeito! Nosso plano básico custa R$ 59/mês e inclui 500 mensagens. Gostaria de mais detalhes?', isFromBot: true, timestamp: new Date('2024-01-15T10:33:00') },
    ]
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    lastMessage: 'Preciso de ajuda técnica',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'pending' as const,
    conversation: [
      { id: '1', content: 'Preciso de ajuda técnica', isFromBot: false, timestamp: new Date('2024-01-15T09:15:00') },
      { id: '2', content: 'Olá Maria! Vou conectar você com nosso suporte técnico. Aguarde um momento.', isFromBot: true, timestamp: new Date('2024-01-15T09:16:00') },
    ]
  },
  {
    id: '3',
    customerName: 'Pedro Costa',
    lastMessage: 'Como faço para cancelar minha assinatura?',
    timestamp: new Date('2024-01-14T16:45:00'),
    status: 'responded' as const,
    conversation: [
      { id: '1', content: 'Como faço para cancelar minha assinatura?', isFromBot: false, timestamp: new Date('2024-01-14T16:45:00') },
      { id: '2', content: 'Para cancelar sua assinatura, acesse Configurações > Assinatura > Cancelar. Você pode cancelar a qualquer momento.', isFromBot: true, timestamp: new Date('2024-01-14T16:46:00') },
    ]
  },
];

export const Messages: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleViewConversation = (message: any) => {
    setSelectedConversation(message);
    setIsOpen(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'responded' ? 'green' : 'orange';
  };

  const getStatusText = (status: string) => {
    return status === 'responded' ? 'Respondido' : 'Pendente';
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={2}>
            Mensagens
          </Text>
          <Text color="gray.600">
            Histórico de conversas com seus clientes
          </Text>
        </Box>

        <Card>
          <VStack gap={4} align="stretch">
            {mockMessages.map((message) => (
              <Box key={message.id} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                <HStack justify="space-between" align="start">
                  <VStack align="start" gap={2}>
                    <Text fontWeight="medium">{message.customerName}</Text>
                    <Text fontSize="sm" color="gray.600" maxW="300px">
                      {message.lastMessage}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {message.timestamp.toLocaleDateString('pt-BR')}
                    </Text>
                  </VStack>
                  <VStack align="end" gap={2}>
                    <Badge colorScheme={getStatusColor(message.status)}>
                      {getStatusText(message.status)}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewConversation(message)}
                    >
                      <FiEye />
                      Ver Conversa
                    </Button>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Card>

        {isOpen && (
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
                    <Text fontWeight="bold">Conversa com {selectedConversation?.customerName}</Text>
                  </HStack>
                  <Button size="sm" onClick={() => setIsOpen(false)}>×</Button>
                </HStack>
              </Box>
              <Box p={4} maxH="400px" overflowY="auto">
                <VStack gap={4} align="stretch">
                  {selectedConversation?.conversation.map((msg: any) => (
                    <Box
                      key={msg.id}
                      alignSelf={msg.isFromBot ? 'flex-start' : 'flex-end'}
                      maxW="80%"
                      p={3}
                      bg={msg.isFromBot ? 'gray.100' : 'blue.500'}
                      color={msg.isFromBot ? 'gray.800' : 'white'}
                      borderRadius="lg"
                    >
                      <Text fontSize="sm">{msg.content}</Text>
                      <Text
                        fontSize="xs"
                        color={msg.isFromBot ? 'gray.500' : 'blue.100'}
                        mt={1}
                      >
                        {msg.timestamp.toLocaleString('pt-BR')}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

