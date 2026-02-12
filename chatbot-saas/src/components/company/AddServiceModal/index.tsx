import React, { useState, useEffect } from 'react';
import {
  Dialog,
  HStack,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { CreateServiceData } from '../../../types/company.types';
import { AddServiceModalForm } from './form';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceData) => Promise<void>;
  isLoading?: boolean;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateServiceData>({
    name: '',
    description: '',
    price: undefined,
    category: 'OUTROS',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateServiceData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome do serviço é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (formData.price !== undefined && formData.price < 0) {
      newErrors.price = 'O preço não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch {
      // Erro tratado pelo componente pai
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: undefined,
      category: 'OUTROS',
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => {
      if (!e.open) {
        handleClose();
      }
    }} size="lg">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxW="600px">
          <Dialog.Header>
            <Dialog.Title>Adicionar Serviço</Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <AddServiceModalForm
              formData={formData}
              errors={errors}
              isLoading={isLoading}
              onChange={handleChange}
            />
          </Dialog.Body>

          <Dialog.Footer>
            <HStack gap={3} justify="flex-end" w="full">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                bg="contexta.500"
                color="white"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                _hover={{ bg: 'contexta.600' }}
              >
                Adicionar Serviço
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
