import React from 'react';
import { VStack, Text } from '@chakra-ui/react';
import { Card } from '@/components/Card';
import { ChatBox } from '@/components/ChatBox';

export interface SimulatorCardMessage {
  id: string;
  content: string;
  isFromBot: boolean;
  timestamp: Date;
}

export interface SimulatorCardProps {
  messages: SimulatorCardMessage[];
  onSendMessage: (message: string) => void;
  isTrained: boolean;
  isProcessing: boolean;
}

export const SimulatorCard: React.FC<SimulatorCardProps> = ({
  messages,
  onSendMessage,
  isTrained,
  isProcessing,
}) => (
  <Card id="tour-chatbot-simulator">
    <VStack gap={4} align="stretch">
      <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
        Simulador de conversa
      </Text>
      <Text color="gray.600" fontSize="sm">
        Teste como seu assistente responderia a um cliente real.
      </Text>
      <ChatBox
        messages={messages}
        onSendMessage={onSendMessage}
        disabled={!isTrained || isProcessing}
        loading={isProcessing}
      />
    </VStack>
  </Card>
);
