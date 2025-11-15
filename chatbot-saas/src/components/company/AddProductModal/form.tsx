import React from 'react';
import {
  VStack,
  Text,
  Input,
  Textarea,
  Field,
} from '@chakra-ui/react';
import { CreateProductData } from '../../../types/company.types';
import { priceMask, priceUnmask } from '../../../utils/masks';

interface AddProductModalFormProps {
  formData: CreateProductData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (field: keyof CreateProductData, value: string | number | undefined) => void;
}

export const AddProductModalForm: React.FC<AddProductModalFormProps> = ({
  formData,
  errors,
  isLoading,
  onChange,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <Field.Root invalid={!!errors.name}>
        <Field.Label>
          Nome do Produto/Serviço <Text as="span" color="red.500">*</Text>
        </Field.Label>
        <Input
          placeholder="Ex: Consultoria em Marketing Digital"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          disabled={isLoading}
        />
        {errors.name && (
          <Field.ErrorText>{errors.name}</Field.ErrorText>
        )}
        <Field.HelperText>
          Nome claro e descritivo do produto ou serviço
        </Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Descrição</Field.Label>
        <Textarea
          placeholder="Descreva detalhadamente o produto ou serviço, incluindo características, benefícios e diferenciais..."
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          resize="vertical"
          disabled={isLoading}
        />
        <Field.HelperText>
          Quanto mais detalhada a descrição, melhor o chatbot poderá responder sobre este produto
        </Field.HelperText>
      </Field.Root>

      <Field.Root invalid={!!errors.price}>
        <Field.Label>Preço (R$)</Field.Label>
        <Input
          type="text"
          placeholder="0,00"
          value={
            formData.price !== undefined && formData.price > 0
              ? priceMask(String(Math.round(formData.price * 100)))
              : ''
          }
          onChange={(e) => {
            const inputValue = e.target.value;
            // Se estiver vazio, limpar
            if (!inputValue || inputValue.trim() === '') {
              onChange('price', undefined);
              return;
            }
            // Converter valor digitado para número
            const unmasked = priceUnmask(inputValue);
            onChange('price', unmasked !== undefined ? unmasked : undefined);
          }}
          onBlur={(e) => {
            // Garantir formatação correta ao sair do campo
            const inputValue = e.target.value;
            if (inputValue && inputValue.trim() !== '') {
              const unmasked = priceUnmask(inputValue);
              if (unmasked !== undefined) {
                // Forçar re-render com valor formatado
                onChange('price', unmasked);
              }
            }
          }}
          disabled={isLoading}
        />
        {errors.price && (
          <Field.ErrorText>{errors.price}</Field.ErrorText>
        )}
        <Field.HelperText>
          Deixe em branco se o preço não se aplica ou varia conforme o caso
        </Field.HelperText>
      </Field.Root>
    </VStack>
  );
};
