import React from 'react';
import { Box, VStack, HStack, Text, Input, Textarea, Button } from '@chakra-ui/react';
import { FiSend } from 'react-icons/fi';
import { Card } from '@/components/Card';

export interface WhatsAppTestSendCardProps {
  testPhoneNumber: string;
  testMessage: string;
  isSendingTest: boolean;
  isWhatsAppLoading: boolean;
  isConnected: boolean;
  onPhoneChange: (value: string) => void;
  onMessageChange: (value: string) => void;
  onSend: () => void;
}

export const WhatsAppTestSendCard: React.FC<WhatsAppTestSendCardProps> = ({
  testPhoneNumber,
  testMessage,
  isSendingTest,
  isWhatsAppLoading,
  isConnected,
  onPhoneChange,
  onMessageChange,
  onSend,
}) => (
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
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
          size="lg"
          mb={4}
          disabled={isSendingTest || isWhatsAppLoading || !isConnected}
        />
      </Box>
      <Box w="full">
        <Text mb={2} fontWeight="medium" fontSize="sm">
          Mensagem
        </Text>
        <Textarea
          placeholder="Digite sua mensagem de teste aqui..."
          value={testMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={3}
          resize="vertical"
          disabled={isSendingTest || isWhatsAppLoading || !isConnected}
        />
      </Box>
      <Button
        onClick={onSend}
        colorScheme="blue"
        size="lg"
        loading={isSendingTest}
        disabled={
          !isConnected || !testPhoneNumber || !testMessage || isSendingTest || isWhatsAppLoading
        }
      >
        <HStack gap={2}>
          <FiSend />
          <Text>Enviar Mensagem de Teste</Text>
        </HStack>
      </Button>
      {!isConnected && (
        <Box p={3} bg="orange.50" border="1px" borderColor="orange.200" borderRadius="md">
          <Text fontSize="sm" color="orange.700">
            Conecte o WhatsApp acima antes de enviar mensagens de teste
          </Text>
        </Box>
      )}
    </VStack>
  </Card>
);
