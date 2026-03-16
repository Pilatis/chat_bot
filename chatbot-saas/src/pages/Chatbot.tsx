'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Input,
  Textarea,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { FiAlertCircle, FiMessageSquare, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Card } from '../components/Card';
import { ChatBox } from '../components/ChatBox';
import { EmptyState } from '../components/ui/empty-state';
import { AITrainingAidMessage } from '../components/company/AI-training-aid-message';
import { Tooltip } from '../components/ui/tooltip';
import { EditAssistantModal } from '../components/chatbot/modals/edit-assistant-modal';
import { DeleteAssistantModal } from '../components/chatbot/modals/delete-assistant-modal';
import { useChatbot } from '../hooks/useChatbot';
import { useCompany } from '../hooks/useCompany';
import { useAssistant } from '../hooks/useAssistant';
import { phoneMask } from '../utils/masks';

const DICAS_TESTE = [
  'Qual o horário de funcionamento?',
  'Quais produtos vocês vendem?',
  'Como posso entrar em contato?',
  'Quais são os preços?',
];

export const Chatbot: React.FC = () => {
  const { company } = useCompany();
  const {
    currentAssistant,
    isLoading: assistantsLoading,
    error: assistantsError,
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

  const isTrained = Boolean(
    company?.products?.length || company?.services?.length
  );

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
  
  if (isLoading && messages.length === 0 && !hasAssistant) {
    return (
      <Box>
        <VStack gap={8} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Assistente
            </Text>
            <Text color="gray.600">
              Configure e teste seu assistente virtual
            </Text>
          </Box>
          <Card>
            <VStack gap={4} align="center" py={8}>
              <Text color="gray.600">Carregando...</Text>
            </VStack>
          </Card>
        </VStack>
      </Box>
    );
  }


  if (!company || company === null) {
    return (
      <Box>
        <VStack gap={8} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Assistente
            </Text>
            <Text color="gray.600" mt={1}>
              Sem empresa cadastrada, os campos do assistente não ficam disponíveis. Cadastre sua empresa primeiro para criar e configurar o assistente.
            </Text>
          </Box>
          <Card>
            <EmptyState
              title="Cadastre sua empresa primeiro"
              description="Para criar um assistente, você precisa ter uma empresa cadastrada. Vá em Empresa no menu, preencha nome e descrição e salve. Depois volte aqui para criar seu primeiro assistente."
              icon={<FiAlertCircle size={48} color="#f59e0b" />}
            >
              <Button
                mt={4}
                bg="contexta.500"
                color="white"
                _hover={{ bg: 'contexta.600' }}
                asChild
              >
                <Link href="/company">Ir para Empresa</Link>
              </Button>
            </EmptyState>
          </Card>
        </VStack>
      </Box>
    );
  }

  if (!hasAssistant) {
    return (
      <Box>
        <VStack gap={8} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Assistente
            </Text>
            <Text color="gray.600">
              Crie seu primeiro assistente para configurar identidade, treino e teste.
            </Text>
          </Box>

          <Card>
            <VStack gap={6} align="stretch">
              <EmptyState
                title="Crie seu primeiro assistente"
                description="Defina o nome e a descrição do assistente que atenderá seus clientes."
                icon={<FiMessageSquare size={48} color="#9ca3af" />}
              />
              <VStack gap={4} align="stretch" as="form" onSubmit={(e) => { e.preventDefault(); handleCreateAssistant(); }}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Nome do assistente (obrigatório)
                  </Text>
                  <Input
                    placeholder="Ex: Atendente Virtual"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    size="md"
                    disabled={isCreating}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Descrição
                  </Text>
                  <Textarea
                    placeholder="O que o assistente vai fazer (ex: tirar dúvidas sobre produtos e horários)"
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    rows={3}
                    resize="vertical"
                    disabled={isCreating}
                  />
                </Box>
                <Box>
                  <Text mb={2} fontWeight="medium" color="gray.600">
                    Número para WhatsApp (opcional)
                  </Text>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={phoneMask(createWhatsApp)}
                    onChange={(e) => setCreateWhatsApp(phoneMask(e.target.value))}
                    size="md"
                    disabled={isCreating}
                  />
                </Box>
                <Button
                  type="submit"
                  bg="contexta.500"
                  color="white"
                  _hover={{ bg: 'contexta.600' }}
                  loading={isCreating}
                  disabled={!createName.trim() || isCreating}
                  alignSelf="flex-start"
                >
                  Criar assistente
                </Button>
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </Box>
    );
  }

  return (

    <Box>
      <VStack gap={8} align="stretch">
        {/* Cabeçalho */}
        <Box id="tour-chatbot-title">
          <HStack gap={4} align="center" flexWrap="wrap">
            <Text fontSize="2xl" fontWeight="bold" color="gray.700">
              Assistente
            </Text>
            <Badge
              colorScheme={isTrained ? 'green' : 'orange'}
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {isTrained ? 'Treinado' : 'Não treinado'}
            </Badge>
          </HStack>
          <Text color="gray.600" mt={1}>
            Configure a identidade, treine a IA com os dados da empresa e teste o simulador.
          </Text>
        </Box>

        {/* Seção: Meu assistente */}
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
                    onClick={openEditModal}
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
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    <FiTrash2 />
                  </IconButton>
                </Tooltip>
              </HStack>
            </HStack>
            <Box>
              <Text fontWeight="medium" color="gray.700">
                {currentAssistant.name}
              </Text>
              {currentAssistant.description && (
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {currentAssistant.description}
                </Text>
              )}
            </Box>
            <Box>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                Número para conexão WhatsApp
              </Text>
              <Text fontSize="sm" color="gray.700">
                {currentAssistant.whatsappNumber || '— Não informado'}
              </Text>
            </Box>
          </VStack>
        </Card>

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

        {/* Seção: Treinar IA */}
        <Card id="tour-chatbot-train">
          <VStack gap={6} align="stretch">
            <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
              Treinar IA com dados da empresa
            </Text>
            <AITrainingAidMessage />
            <Button
              onClick={handleTrainAI}
              bg="green.500"
              color="white"
              size="lg"
              _hover={{ bg: 'green.600' }}
              disabled={
                !isTrained ||
                isTraining
              }
              loading={isTraining}
              alignSelf="flex-start"
            >
              {isTrained ? 'Retreinar IA' : 'Treinar IA'}
            </Button>
            {!isTrained && (
              <HStack p={4} bg="orange.50" borderRadius="md" borderWidth="1px" borderColor="orange.200">
                <FiAlertCircle color="var(--chakra-colors-orange-500)" />
                <Text fontSize="sm" color="orange.700">
                  Cadastre produtos ou serviços na página Empresa para poder treinar a IA.
                </Text>
              </HStack>
            )}
          </VStack>
        </Card>

        {/* Seção: Simulador de conversa */}
        <Card id="tour-chatbot-simulator">
          <VStack gap={4} align="stretch">
            <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
              Simulador de conversa
            </Text>
            <Text color="gray.600" fontSize="sm">
              Teste como seu assistente responderia a um cliente real.
            </Text>
            <ChatBox
              messages={messages.map((msg) => ({
                id: msg.id,
                content: msg.content,
                isFromBot: msg.from === 'BOT',
                timestamp: new Date(msg.createdAt),
              }))}
              onSendMessage={handleSendMessage}
              disabled={!isTrained || isProcessing}
              loading={isProcessing}
            />
          </VStack>
        </Card>

        {/* Seção: Dicas para testar */}
        <Card id="tour-chatbot-tips">
          <VStack gap={4} align="stretch">
            <Text as="h2" fontSize="lg" fontWeight="semibold" color="gray.800">
              Dicas para testar
            </Text>
            <VStack gap={2} align="stretch">
              {DICAS_TESTE.map((dica, i) => (
                <Text key={i} fontSize="sm" color="gray.600">
                  • &quot;{dica}&quot;
                </Text>
              ))}
            </VStack>
          </VStack>
        </Card>
      </VStack>
    </Box>

    );
  }

