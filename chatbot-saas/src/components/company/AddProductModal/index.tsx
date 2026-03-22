import React from 'react';
import {
  Dialog,
  HStack,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { Formik, Form, FormikProps } from 'formik';
import type { CreateProductData } from '@/types/company.types';
import type { CreateProductFormValues } from '@/schemas/company.schemas';
import { useCreateProductValidationSchema } from '@/hooks/useCompanyCatalogFormSchema';
import { AddProductModalForm } from './form';

function mapValuesToCreateProduct(values: CreateProductFormValues): CreateProductData {
  return {
    name: values.name.trim(),
    category: values.category,
    description: values.description.trim(),
    price: values.price ?? undefined,
  };
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: CreateProductData) => Promise<void>;
  isLoading?: boolean;
}

const initialValues: CreateProductFormValues = {
  name: '',
  description: '',
  category: 'OUTROS',
  price: undefined,
};

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const validationSchema = useCreateProductValidationSchema();

  const handleClose = (resetForm: FormikProps<CreateProductFormValues>['resetForm']) => {
    resetForm();
    onClose();
  };

  return (
    <Formik<CreateProductFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize
      onSubmit={async (values, { resetForm }) => {
        try {
          await onSave(mapValuesToCreateProduct(values));
          resetForm();
          onClose();
        } catch {
          // Erro tratado pelo componente pai
        }
      }}
    >
      {({ resetForm, submitForm }) => (
        <Dialog.Root
          open={isOpen}
          onOpenChange={(e) => {
            if (!e.open) {
              handleClose(resetForm);
            }
          }}
          size="lg"
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="600px">
              <Form>
                <Dialog.Header>
                  <Dialog.Title>Adicionar Produto</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => handleClose(resetForm)} />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body>
                  <AddProductModalForm isLoading={isLoading} />
                </Dialog.Body>

                <Dialog.Footer>
                  <HStack gap={3} justify="flex-end" w="full">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleClose(resetForm)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      bg="contexta.500"
                      color="white"
                      onClick={() => submitForm()}
                      loading={isLoading}
                      disabled={isLoading}
                      _hover={{ bg: 'contexta.600' }}
                    >
                      Adicionar Produto
                    </Button>
                  </HStack>
                </Dialog.Footer>
              </Form>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      )}
    </Formik>
  );
};
