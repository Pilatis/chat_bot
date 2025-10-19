import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { Card } from '../components/Card';
import { ChatBox } from '../components/ChatBox';
import { useChatbot } from '../hooks/useChatbot';
import { useCompany } from '../hooks/useCompany';
import { useAuth } from '../hooks/useAuth';

export const Chatbot: React.FC = () => {
  const { company } = useCompany();
  const { user } = useAuth();
  const { 
    messages, 
    isLoading, 
    isProcessing, 
    error, 
    stats, 
    sendMessage, 
    trainAI, 
    getChatHistory, 
    getChatStats, 
    clearMessages, 
    clearError 
  } = useChatbot();

  const isTrained = company && company.products && company.products.length > 0;

  // Carregar histórico e estatísticas quando o componente montar
  useEffect(() => {
    if (company?.id) {
      getChatHistory();
      getChatStats();
    }
  }, [company?.id]);

  const handleSendMessage = async (content: string) => {
    if (!company?.id) return;
    
    try {
      await sendMessage(content);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const handleTrainAI = async () => {
    if (!company?.id) return;
    
    try {
      await trainAI();
    } catch (err) {
      console.error('Erro ao treinar IA:', err);
    }
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <HStack gap={4} align="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Teste do Chatbot
            </Text>
            <Badge
              colorScheme={isTrained ? 'green' : 'orange'}
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {isTrained ? 'Treinado' : 'Não Treinado'}
            </Badge>
          </HStack>
          <Text color="gray.600">
            Teste o seu chatbot antes de colocá-lo em produção
          </Text>
        </Box>

        {!isTrained && (
          <Box p={4} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md">
            <HStack>
              <FiAlertCircle color="orange" />
              <Box>
                <Text fontWeight="bold" color="orange.700">Chatbot não treinado!</Text>
                <Text fontSize="sm" color="orange.600">
                  Configure os dados da sua empresa na página "Empresa" para treinar o chatbot.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        {isTrained && (
          <Box p={4} bg="green.50" border="1px" borderColor="green.200" borderRadius="md">
            <HStack>
              <FiCheckCircle color="green" />
              <Box>
                <Text fontWeight="bold" color="green.700">Chatbot treinado e funcionando!</Text>
                <Text fontSize="sm" color="green.600">
                  O chatbot está pronto para atender seus clientes com base nas informações da sua empresa.
                </Text>
              </Box>
            </HStack>
          </Box>
        )}

        <Card>
          <VStack gap={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold">
              Simulador de Conversa
            </Text>
            <Text color="gray.600" fontSize="sm">
              Digite uma pergunta para testar como o chatbot responderia a um cliente real.
            </Text>
            
            <ChatBox
              messages={messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                isFromBot: msg.from === 'BOT',
                timestamp: new Date(msg.createdAt)
              }))}
              onSendMessage={handleSendMessage}
              disabled={!isTrained || isProcessing}
              loading={isProcessing}
            />
          </VStack>
        </Card>

        <Card>
          <VStack gap={4} align="stretch">
            <Text fontSize="lg" fontWeight="semibold">
              Dicas para Testar
            </Text>
            <VStack gap={2} align="stretch">
              <Text fontSize="sm" color="gray.600">
                • "Qual o horário de funcionamento?"
              </Text>
              <Text fontSize="sm" color="gray.600">
                • "Quais produtos vocês vendem?"
              </Text>
              <Text fontSize="sm" color="gray.600">
                • "Como posso entrar em contato?"
              </Text>
              <Text fontSize="sm" color="gray.600">
                • "Quais são os preços?"
              </Text>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </Box>
  );
};

