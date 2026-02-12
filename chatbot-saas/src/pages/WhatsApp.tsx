import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  Badge,
} from '@chakra-ui/react';
import { Accordion } from '@chakra-ui/react';
import { FiSend, FiEye, FiMessageSquare } from 'react-icons/fi';
import { Card } from '../components/Card';
import { EmptyState } from '../components/ui/empty-state';
import { WhatsAppConnection } from '../components/company/WhatsAppConnection';
import { useWhatsApp } from '../providers';
import { useCompany } from '../hooks/useCompany';
import { useToast } from '../hooks/useToast';

const mockConversations = [
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
    ],
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
    ],
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
    ],
  },
];

export const WhatsApp: React.FC = () => {
  const { company } = useCompany();
  const {
    sendMessage,
    currentSession,
    isLoading: isWhatsAppLoading,
    getSessionStatus,
  } = useWhatsApp();
  const { showError } = useToast();

  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<typeof mockConversations[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const checkWhatsAppStatus = async () => {
      if (!company?.id) return;
      const sessionName = `company_${company.id}`;
      try {
        await getSessionStatus(sessionName);
      } catch {
        // Sessão não existe
      }
    };
    const timeoutId = setTimeout(() => checkWhatsAppStatus(), 500);
    return () => clearTimeout(timeoutId);
  }, [company?.id]);

  const handleSendTestMessage = async () => {
    if (!currentSession?.sessionName) {
      showError('Conecte o WhatsApp primeiro antes de enviar mensagens de teste', {
        title: 'WhatsApp não conectado',
      });
      return;
    }
    if (!testPhoneNumber || !testMessage) {
      showError('Preencha o número de telefone e a mensagem', {
        title: 'Campos obrigatórios',
      });
      return;
    }
    setIsSendingTest(true);
    const result = await sendMessage({
      sessionName: currentSession.sessionName,
      phoneNumber: testPhoneNumber,
      message: testMessage,
    });
    if (result === 'success') {
      setTestMessage('');
    }
    setIsSendingTest(false);
  };

  const handleViewConversation = (conversation: typeof mockConversations[0]) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => (status === 'responded' ? 'green' : 'orange');
  const getStatusText = (status: string) => (status === 'responded' ? 'Respondido' : 'Pendente');

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Text fontSize="h2" fontWeight="h2" color="grayBold" mb={2}>
            WhatsApp
          </Text>
          <Text color="grayBold">
            Conecte seu WhatsApp e acompanhe as conversas com seus clientes
          </Text>
        </Box>

        <WhatsAppConnection />

        <Card>
          <VStack gap={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              Teste de Envio de Mensagem
            </Text>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Envie uma mensagem de teste para verificar se o WhatsApp está funcionando corretamente
            </Text>
            <Box w="full">
              <Text mb={2} fontWeight="medium" fontSize="sm">
                Número de Telefone
              </Text>
              <Input
                placeholder="11999999999 ou 5511999999999"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value.replace(/\D/g, ''))}
                size="lg"
                mb={4}
                disabled={isSendingTest || isWhatsAppLoading || !currentSession?.isConnected}
              />
            </Box>
            <Box w="full">
              <Text mb={2} fontWeight="medium" fontSize="sm">
                Mensagem
              </Text>
              <Textarea
                placeholder="Digite sua mensagem de teste aqui..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={3}
                resize="vertical"
                disabled={isSendingTest || isWhatsAppLoading || !currentSession?.isConnected}
              />
            </Box>
            <Button
              onClick={handleSendTestMessage}
              colorScheme="blue"
              size="lg"
              loading={isSendingTest}
              disabled={
                !currentSession?.isConnected ||
                !testPhoneNumber ||
                !testMessage ||
                isSendingTest ||
                isWhatsAppLoading
              }
            >
              <HStack gap={2}>
                <FiSend />
                <Text>Enviar Mensagem de Teste</Text>
              </HStack>
            </Button>
            {!currentSession?.isConnected && (
              <Box p={3} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md">
                <Text fontSize="sm" color="orange.700">
                  Conecte o WhatsApp acima antes de enviar mensagens de teste
                </Text>
              </Box>
            )}
          </VStack>
        </Card>

        <Accordion.Root collapsible defaultValue={[]}>
          <Accordion.Item value="historico-conversas" border="1px" borderColor="gray.200" borderRadius="md" overflow="hidden" bg="white">
            <Accordion.ItemTrigger _open={{ bg: 'gray.50' }}>
              <Box as="span" flex="1" textAlign="left">
                <HStack>
                  <FiMessageSquare />
                  <Text fontWeight="semibold">Histórico de conversas</Text>
                  <Badge colorScheme="gray" fontSize="xs">
                    {mockConversations.length} conversas
                  </Badge>
                </HStack>
              </Box>
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody pb={4}>
                <VStack gap={4} align="stretch">
                  {mockConversations.length === 0 ? (
                    <EmptyState
                      title="Nenhuma conversa encontrada"
                      description="Quando seus clientes enviarem mensagens via WhatsApp, elas aparecerão aqui"
                      icon={<FiMessageSquare size={48} color="#9ca3af" />}
                    />
                  ) : (
                    mockConversations.map((conversation) => (
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
                            <Badge colorScheme={getStatusColor(conversation.status)}>
                              {getStatusText(conversation.status)}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewConversation(conversation)}
                            >
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
      </VStack>

      {isModalOpen && selectedConversation && (
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
          <Box
            bg="white"
            borderRadius="md"
            maxW="600px"
            w="full"
            maxH="80vh"
            overflow="hidden"
          >
            <Box p={4} borderBottom="1px" borderColor="gray.200">
              <HStack justify="space-between">
                <HStack>
                  <FiMessageSquare />
                  <Text fontWeight="bold">
                    Conversa com {selectedConversation.customerName}
                  </Text>
                </HStack>
                <Button size="sm" onClick={() => setIsModalOpen(false)}>
                  Fechar
                </Button>
              </HStack>
            </Box>
            <Box p={4} maxH="400px" overflowY="auto">
              <VStack gap={4} align="stretch">
                {selectedConversation.conversation.map((msg) => (
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
                    <Text
                      fontSize="xs"
                      color={msg.isFromBot ? 'gray.500' : 'gray.200'}
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
    </Box>
  );
};
