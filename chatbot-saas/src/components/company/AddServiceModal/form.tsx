import React from 'react';
import {
  VStack,
  Text,
  Input,
  Textarea,
  Field,
} from '@chakra-ui/react';
import { useFormikContext } from 'formik';
import { MACRO_CATEGORIES } from '@/types/company.types';
import { priceMask, priceUnmask } from '@/utils/masks';
import { useFormikFieldError } from '@/hooks/useFormikFieldError';
import { CustomSelect } from '../../ui/select';
import type { CreateServiceFormValues } from '@/schemas/company.schemas';

interface AddServiceModalFormProps {
  isLoading: boolean;
}

export const AddServiceModalForm: React.FC<AddServiceModalFormProps> = ({ isLoading }) => {
  const { values, setFieldValue, setFieldTouched, handleBlur } =
    useFormikContext<CreateServiceFormValues>();

  const nameError = useFormikFieldError<CreateServiceFormValues>('name');
  const categoryError = useFormikFieldError<CreateServiceFormValues>('category');
  const descriptionError = useFormikFieldError<CreateServiceFormValues>('description');
  const priceError = useFormikFieldError<CreateServiceFormValues>('price');

  return (
    <VStack gap={4} align="stretch">
      <Field.Root invalid={!!nameError}>
        <Field.Label>
          Nome do Serviço <Text as="span" color="red.500">*</Text>
        </Field.Label>
        <Input
          name="name"
          placeholder="Ex: Consultoria em Marketing Digital"
          value={values.name}
          onChange={(e) => setFieldValue('name', e.target.value)}
          onBlur={handleBlur}
          disabled={isLoading}
        />
        {nameError && <Field.ErrorText>{nameError}</Field.ErrorText>}
        <Field.HelperText>
          Nome claro e descritivo do serviço
        </Field.HelperText>
      </Field.Root>

      <Field.Root invalid={!!categoryError}>
        <Field.Label>
          Categoria <Text as="span" color="red.500">*</Text>
        </Field.Label>
        <CustomSelect
          value={values.category}
          onChange={(value) => {
            setFieldValue('category', value);
            setFieldTouched('category', true);
          }}
          options={MACRO_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
          placeholder="Selecione a categoria"
          size="md"
        />
        {categoryError && <Field.ErrorText>{categoryError}</Field.ErrorText>}
        <Field.HelperText>
          Macro-categoria do serviço para organização e IA
        </Field.HelperText>
      </Field.Root>

      <Field.Root invalid={!!descriptionError}>
        <Field.Label>
          Descrição <Text as="span" color="red.500">*</Text>
        </Field.Label>
        <Textarea
          name="description"
          placeholder="Descreva o serviço: escopo, benefícios e como é entregue..."
          value={values.description ?? ''}
          onChange={(e) => setFieldValue('description', e.target.value)}
          onBlur={handleBlur}
          rows={4}
          resize="vertical"
          disabled={isLoading}
        />
        {descriptionError && <Field.ErrorText>{descriptionError}</Field.ErrorText>}
        <Field.HelperText>
          Quanto mais detalhada a descrição, melhor o chatbot poderá responder sobre este serviço
        </Field.HelperText>
      </Field.Root>

      <Field.Root invalid={!!priceError}>
        <Field.Label>Preço (R$)</Field.Label>
        <Input
          type="text"
          name="price"
          placeholder="0,00"
          value={
            values.price != null && values.price > 0
              ? priceMask(String(Math.round(values.price * 100)))
              : ''
          }
          onChange={(e) => {
            const inputValue = e.target.value;
            if (!inputValue || inputValue.trim() === '') {
              setFieldValue('price', undefined);
              return;
            }
            const unmasked = priceUnmask(inputValue);
            setFieldValue('price', unmasked !== undefined ? unmasked : undefined);
          }}
          onBlur={(e) => {
            handleBlur(e);
            const inputValue = e.target.value;
            if (inputValue && inputValue.trim() !== '') {
              const unmasked = priceUnmask(inputValue);
              if (unmasked !== undefined) {
                setFieldValue('price', unmasked);
              }
            }
          }}
          disabled={isLoading}
        />
        {priceError && <Field.ErrorText>{priceError}</Field.ErrorText>}
        <Field.HelperText>
          Deixe em branco se o preço não se aplica ou varia conforme o caso
        </Field.HelperText>
      </Field.Root>
    </VStack>
  );
};
