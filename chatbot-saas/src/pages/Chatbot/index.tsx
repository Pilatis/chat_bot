'use client';

import React, { useMemo, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { EditAssistantModal } from '@/components/chatbot/modals/edit-assistant-modal';
import { DeleteAssistantModal } from '@/components/chatbot/modals/delete-assistant-modal';
import { useChatbot } from '@/hooks/useChatbot';
import { useCompany } from '@/hooks/useCompany';
import { useAssistant } from '@/hooks/useAssistant';
import { ChatbotLoading } from './ChatbotLoading';
import { ChatbotNoCompany } from './ChatbotNoCompany';
import { ChatbotOnboardingForm } from './ChatbotOnboardingForm';
import { ChatbotPageHeader } from './components/ChatbotPageHeader';
import { AssistantIdentityCard } from './components/AssistantIdentityCard';
import { TrainIACard } from './components/TrainIACard';
import { SimulatorCard } from './components/SimulatorCard';
import { TestTipsCard } from './components/TestTipsCard';

export const Chatbot: React.FC = () => {
  const { company } = useCompany();
  const {
    currentAssistant,
    isLoading: assistantsLoading,
    createAssistant,
    updateAssistant,
    deleteAssistant,
  } = useAssistant();
  const {
    messages,
    isLoading: chatLoading,
    isProcessing,
    sendMessage,
    trainAI,
    isTraining,
  } = useChatbot();

  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createWhatsApp, setCreateWhatsApp] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isTrained = Boolean(company?.products?.length || company?.services?.length);

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

  const handleCreateAssistant = async () => {
    if (!company?.id || !createName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createAssistant(company.id, {
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        whatsappNumber: createWhatsApp.trim() || undefined,
      });
      if (result === 'success') {
        setCreateName('');
        setCreateDescription('');
        setCreateWhatsApp('');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = () => {
    if (currentAssistant) setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: { name?: string; description?: string; whatsappNumber?: string }) => {
    if (!currentAssistant?.id) return;
    setIsUpdating(true);
    try {
      const result = await updateAssistant(currentAssistant.id, data);
      if (result === 'success') setIsEditModalOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentAssistant?.id) return;
    setIsDeleting(true);
    try {
      const result = await deleteAssistant(currentAssistant.id);
      if (result === 'success') setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasAssistant = currentAssistant != null;
  const isLoading = chatLoading || (hasAssistant === false && assistantsLoading);

  const chatBoxMessages = useMemo(
    () =>
      messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isFromBot: msg.from === 'BOT',
        timestamp: new Date(msg.createdAt),
      })),
    [messages]
  );

  if (isLoading && messages.length === 0 && !hasAssistant) {
    return <ChatbotLoading />;
  }

  if (!company || company === null) {
    return <ChatbotNoCompany />;
  }

  if (!hasAssistant) {
    return (
      <ChatbotOnboardingForm
        createName={createName}
        createDescription={createDescription}
        createWhatsApp={createWhatsApp}
        isCreating={isCreating}
        onCreateNameChange={setCreateName}
        onCreateDescriptionChange={setCreateDescription}
        onCreateWhatsAppChange={setCreateWhatsApp}
        onSubmit={handleCreateAssistant}
      />
    );
  }

  return (
    <Box>
      <VStack gap={8} align="stretch">
        <ChatbotPageHeader isTrained={isTrained} />

        <AssistantIdentityCard
          assistant={currentAssistant}
          onEdit={openEditModal}
          onDelete={() => setIsDeleteConfirmOpen(true)}
        />

        <EditAssistantModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          assistant={currentAssistant}
          onSave={handleSaveEdit}
          isLoading={isUpdating}
        />
        <DeleteAssistantModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          assistantName={currentAssistant.name}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
        />

        <TrainIACard isTrained={isTrained} isTraining={Boolean(isTraining)} onTrain={handleTrainAI} />

        <SimulatorCard
          messages={chatBoxMessages}
          onSendMessage={handleSendMessage}
          isTrained={isTrained}
          isProcessing={isProcessing}
        />

        <TestTipsCard />
      </VStack>
    </Box>
  );
};
