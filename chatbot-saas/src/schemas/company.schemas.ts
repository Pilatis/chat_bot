import * as Yup from 'yup';
import type { MacroCategory } from '@/types/company.types';
import { MACRO_CATEGORIES } from '@/types/company.types';

/** Valores válidos para `oneOf` (Yup exige tupla não vazia) */
const MACRO_CATEGORY_VALUES = MACRO_CATEGORIES.map((c) => c.value) as [
  MacroCategory,
  ...MacroCategory[],
];

const optionalPrice = Yup.number()
  .transform((value, originalValue) => {
    if (originalValue === '' || originalValue === null || originalValue === undefined) {
      return undefined;
    }
    return value;
  })
  .optional()
  .nullable()
  .min(0, 'O preço não pode ser negativo')
  .max(999_999_999.99, 'Valor de preço inválido');

/** Descrição obrigatória (produto e serviço) */
const requiredDescription = Yup.string()
  .trim()
  .min(2, 'Descrição deve ter pelo menos 2 caracteres')
  .max(5000, 'Descrição deve ter no máximo 5000 caracteres')
  .required('Descrição é obrigatória');

const categoryField = Yup.string()
  .oneOf(MACRO_CATEGORY_VALUES, 'Selecione uma categoria válida')
  .required('Categoria é obrigatória');

/**
 * Produto novo (modal) — alinhado a {@link CreateProductData}
 */
export const createProductSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .required('Nome do produto é obrigatório'),
  category: categoryField,
  description: requiredDescription,
  price: optionalPrice,
});

/**
 * Serviço novo (modal) — alinhado a {@link CreateServiceData}
 */
export const createServiceSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .required('Nome do serviço é obrigatório'),
  category: categoryField,
  description: requiredDescription,
  price: optionalPrice,
});

export type CreateProductFormValues = Yup.InferType<typeof createProductSchema>;
export type CreateServiceFormValues = Yup.InferType<typeof createServiceSchema>;
