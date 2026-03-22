import React from 'react';
import {
  Dialog,
  HStack,
  Button,
  CloseButton,
} from '@chakra-ui/react';
import { Formik, Form, FormikProps } from 'formik';
import type { CreateServiceData } from '@/types/company.types';
import type { CreateServiceFormValues } from '@/schemas/company.schemas';
import { useCreateServiceValidationSchema } from '@/hooks/useCompanyCatalogFormSchema';
import { AddServiceModalForm } from './form';

function mapValuesToCreateService(values: CreateServiceFormValues): CreateServiceData {
  return {
    name: values.name.trim(),
    category: values.category,
    description: values.description.trim(),
    price: values.price ?? undefined,
  };
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateServiceData) => Promise<void>;
  isLoading?: boolean;
}

const initialValues: CreateServiceFormValues = {
  name: '',
  description: '',
  category: 'OUTROS',
  price: undefined,
};

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const validationSchema = useCreateServiceValidationSchema();

  const handleClose = (resetForm: FormikProps<CreateServiceFormValues>['resetForm']) => {
    resetForm();
    onClose();
  };

  return (
    <Formik<CreateServiceFormValues>
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
      enableReinitialize
      onSubmit={async (values, { resetForm }) => {
        try {
          await onSave(mapValuesToCreateService(values));
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
                  <Dialog.Title>Adicionar Serviço</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" onClick={() => handleClose(resetForm)} />
                  </Dialog.CloseTrigger>
                </Dialog.Header>

                <Dialog.Body>
                  <AddServiceModalForm isLoading={isLoading} />
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
                      Adicionar Serviço
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
