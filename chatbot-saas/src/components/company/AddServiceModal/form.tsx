import React from 'react';
import {
  VStack,
  Text,
  Input,
  Textarea,
  Field,
} from '@chakra-ui/react';
import { CreateServiceData, MACRO_CATEGORIES } from '../../../types/company.types';
import { priceMask, priceUnmask } from '../../../utils/masks';
import { CustomSelect } from '../../ui/select';

interface AddServiceModalFormProps {
  formData: CreateServiceData;
  errors: Record<string, string>;
  isLoading: boolean;
  onChange: (field: keyof CreateServiceData, value: string | number | undefined) => void;
}

export const AddServiceModalForm: React.FC<AddServiceModalFormProps> = ({
  formData,
  errors,
  isLoading,
  onChange,
}) => {
  return (
    <VStack gap={4} align="stretch">
      <Field.Root invalid={!!errors.name}>
        <Field.Label>
          Nome do Serviço <Text as="span" color="red.500">*</Text>
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
          Nome claro e descritivo do serviço
        </Field.HelperText>
      </Field.Root>

      <Field.Root invalid={!!errors.category}>
        <Field.Label>
          Categoria <Text as="span" color="red.500">*</Text>
        </Field.Label>
        <CustomSelect
          value={formData.category}
          onChange={(value) => onChange('category', value as CreateServiceData['category'])}
          options={MACRO_CATEGORIES.map(c => ({ value: c.value, label: c.label }))}
          placeholder="Selecione a categoria"
          size="md"
        />
        {errors.category && (
          <Field.ErrorText>{errors.category}</Field.ErrorText>
        )}
        <Field.HelperText>
          Macro-categoria do serviço para organização e IA
        </Field.HelperText>
      </Field.Root>

      <Field.Root>
        <Field.Label>Descrição</Field.Label>
        <Textarea
          placeholder="Descreva o serviço: escopo, benefícios e como é entregue..."
          value={formData.description || ''}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          resize="vertical"
          disabled={isLoading}
        />
        <Field.HelperText>
          Quanto mais detalhada a descrição, melhor o chatbot poderá responder sobre este serviço
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
            if (!inputValue || inputValue.trim() === '') {
              onChange('price', undefined);
              return;
            }
            const unmasked = priceUnmask(inputValue);
            onChange('price', unmasked !== undefined ? unmasked : undefined);
          }}
          onBlur={(e) => {
            const inputValue = e.target.value;
            if (inputValue && inputValue.trim() !== '') {
              const unmasked = priceUnmask(inputValue);
              if (unmasked !== undefined) {
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
