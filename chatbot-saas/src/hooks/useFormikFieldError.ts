import { useFormikContext } from 'formik';

/**
 * Mensagem de erro de campo Formik após submit ou blur (touch).
 * Útil com `validateOnChange={false}` e validação Yup.
 */
export function useFormikFieldError<T extends Record<string, unknown>>(
  field: keyof T
): string | undefined {
  const { errors, touched, submitCount } = useFormikContext<T>();
  const err = errors[field];
  if (err === undefined || err === null || err === '') {
    return undefined;
  }
  const show = submitCount > 0 || Boolean(touched[field]);
  return show ? String(err) : undefined;
}
