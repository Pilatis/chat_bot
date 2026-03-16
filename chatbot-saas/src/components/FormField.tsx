'use client';

import React from 'react';
import { Box, Text, Input } from '@chakra-ui/react';
import { Field, FieldProps, useFormikContext } from 'formik';
import { PasswordInput } from './PasswordInput';

export type FormFieldType = 'text' | 'email' | 'password';

export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: FormFieldType;
  showErrorAfterSubmitOnly?: boolean;
  children?: React.ReactNode;
  renderInput?: (
    field: FieldProps['field'],
    meta: FieldProps['meta'],
    options: { showError: boolean }
  ) => React.ReactNode;
}

const defaultInputProps = {
  size: 'lg' as const,
  bg: 'gray.50' as const,
  borderColor: 'grayBorder' as const,
  borderRadius: 'lg' as const,
};

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  placeholder,
  type = 'text',
  showErrorAfterSubmitOnly = true,
  children,
  renderInput,
}) => {
  const { submitCount } = useFormikContext();

  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => {
        const showError = showErrorAfterSubmitOnly
          ? submitCount > 0 && !!meta.error
          : !!(meta.touched && meta.error);

        const inputNode = renderInput ? (
          renderInput(field, meta, { showError })
        ) : type === 'password' ? (
          <PasswordInput
            {...field}
            placeholder={placeholder}
            borderColor={showError ? 'red.500' : defaultInputProps.borderColor}
            bg={defaultInputProps.bg}
            borderRadius={defaultInputProps.borderRadius}
            size={defaultInputProps.size}
          />
        ) : (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            size={defaultInputProps.size}
            bg={defaultInputProps.bg}
            borderColor={showError ? 'red.500' : defaultInputProps.borderColor}
            borderRadius={defaultInputProps.borderRadius}
          />
        );

        return (
          <Box w="full">
            {label && (
              <Text fontSize="sm" fontWeight="500" color="gray.700" mb={1.5}>
                {label}
              </Text>
            )}
            {inputNode}
            {children}
            {showError && meta.error && (
              <Text color="red.500" fontSize="sm" mt={1}>
                {meta.error}
              </Text>
            )}
          </Box>
        );
      }}
    </Field>
  );
};
