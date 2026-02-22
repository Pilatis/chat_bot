'use client';

import React from 'react';
import { HStack, Text, Button } from '@chakra-ui/react';
import { Modal } from '@/components/modal';

export interface DeleteAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistantName: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteAssistantModal: React.FC<DeleteAssistantModalProps> = ({
  isOpen,
  onClose,
  assistantName,
  onConfirm,
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  const footer = (
    <HStack gap={3} justify="flex-end" w="full">
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancelar
      </Button>
      <Button
        colorPalette="red"
        onClick={handleConfirm}
        loading={isLoading}
        disabled={isLoading}
      >
        Remover
      </Button>
    </HStack>
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Remover assistente"
      description="Esta ação não pode ser desfeita."
      size="md"
      footer={footer}
    >
      <Text color="gray.600">
        Tem certeza que deseja remover o assistente &quot;{assistantName}&quot;? Esta ação não pode ser desfeita.
      </Text>
    </Modal>
  );
};
