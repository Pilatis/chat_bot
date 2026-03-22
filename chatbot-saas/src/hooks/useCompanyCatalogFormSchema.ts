import { useMemo } from 'react';
import {
  createProductSchema,
  createServiceSchema,
} from '@/schemas/company.schemas';

/**
 * Schema Yup para o modal de adicionar produto (Formik `validationSchema`).
 */
export function useCreateProductValidationSchema() {
  return useMemo(() => createProductSchema, []);
}

/**
 * Schema Yup para o modal de adicionar serviço (Formik `validationSchema`).
 */
export function useCreateServiceValidationSchema() {
  return useMemo(() => createServiceSchema, []);
}
