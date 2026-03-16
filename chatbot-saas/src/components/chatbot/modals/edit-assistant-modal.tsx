'use client';

import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Input, Textarea, Button } from '@chakra-ui/react';
import { Modal } from '@/components/Modal';
import type { Assistant, UpdateAssistantData } from '@/types/assistant.types';
import { phoneMask } from '@/utils/masks';

export interface EditAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: Assistant | null;
  onSave: (data: UpdateAssistantData) => Promise<void>;
  isLoading?: boolean;
}

export const EditAssistantModal: React.FC<EditAssistantModalProps> = ({
  isOpen,
  onClose,
  assistant,
  onSave,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    if (isOpen && assistant) {
      setName(assistant.name);
      setDescription(assistant.description ?? '');
      setWhatsapp(assistant.whatsappNumber ?? '');
    }
  }, [isOpen, assistant]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      whatsappNumber: whatsapp.trim() || undefined,
    });
    // O pai fecha o modal quando a operação for sucesso
  };

  if (!assistant) return null;

  const footer = (
    <HStack gap={3} justify="flex-end" w="full">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        bg="contexta.500"
        color="white"
        _hover={{ bg: 'contexta.600' }}
        onClick={handleSubmit}
        loading={isLoading}
        disabled={!name.trim() || isLoading}
      >
        Salvar
      </Button>
    </HStack>
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Editar assistente"
      description="Altere os dados do assistente"
      size="lg"
      footer={footer}
    >
      <VStack gap={4} align="stretch">
        <Box>
          <Text mb={2} fontWeight="medium">
            Nome do assistente (obrigatório)
          </Text>
          <Input
            placeholder="Ex: Atendente Virtual"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="md"
            disabled={isLoading}
          />
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium">
            Descrição
          </Text>
          <Textarea
            placeholder="O que o assistente vai fazer"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            resize="vertical"
            disabled={isLoading}
          />
        </Box>
        <Box>
          <Text mb={2} fontWeight="medium" color="gray.600">
            Número para WhatsApp (opcional)
          </Text>
          <Input
            placeholder="(11) 99999-9999"
            value={phoneMask(whatsapp)}
            onChange={(e) => setWhatsapp(phoneMask(e.target.value))}
            size="md"
            disabled={isLoading}
          />
        </Box>
      </VStack>
    </Modal>
  );
};
