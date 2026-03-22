import React, { useState, useEffect } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { WhatsAppConnection } from '@/components/company/WhatsAppConnection';
import { useWhatsApp } from '@/providers';
import { useCompany } from '@/hooks/useCompany';
import { useToast } from '@/hooks/useToast';
import { MOCK_CONVERSATIONS } from './mockConversations';
import type { MockConversation } from './types';
import { WhatsAppPageHeader } from './components/WhatsAppPageHeader';
import { WhatsAppTestSendCard } from './components/WhatsAppTestSendCard';
import { ConversationHistorySection } from './components/ConversationHistorySection';
import { ConversationDetailModal } from './components/ConversationDetailModal';

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
  const [selectedConversation, setSelectedConversation] = useState<MockConversation | null>(null);
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
  }, [company?.id, getSessionStatus]);

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

  const handleViewConversation = (conversation: MockConversation) => {
    setSelectedConversation(conversation);
    setIsModalOpen(true);
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <WhatsAppPageHeader />

        <WhatsAppConnection />

        <WhatsAppTestSendCard
          testPhoneNumber={testPhoneNumber}
          testMessage={testMessage}
          isSendingTest={isSendingTest}
          isWhatsAppLoading={isWhatsAppLoading}
          isConnected={!!currentSession?.isConnected}
          onPhoneChange={setTestPhoneNumber}
          onMessageChange={setTestMessage}
          onSend={handleSendTestMessage}
        />

        <ConversationHistorySection
          conversations={MOCK_CONVERSATIONS}
          onViewConversation={handleViewConversation}
        />
      </VStack>

      {isModalOpen && selectedConversation && (
        <ConversationDetailModal
          conversation={selectedConversation}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Box>
  );
};
