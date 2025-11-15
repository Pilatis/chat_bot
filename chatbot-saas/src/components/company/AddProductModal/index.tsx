import React, { useState, useEffect } from 'react';
import {
  Dialog,
  HStack,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { CreateProductData } from '../../../types/company.types';
import { AddProductModalForm } from './form';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: CreateProductData) => Promise<void>;
  isLoading?: boolean;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    price: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateProductData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Nome do produto é obrigatório';
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
      // Limpar formulário após salvar
      resetForm();
      onClose();
    } catch (error) {
      // Erro será tratado pelo componente pai
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: undefined,
    });
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Resetar formulário quando o modal fechar
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
            <Dialog.Title>Adicionar Produto/Serviço</Dialog.Title>
            <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <AddProductModalForm
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
                bg="primaryButton"
                color="white"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                _hover={{ bg: 'baseOrange' }}
              >
                Adicionar Produto
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

