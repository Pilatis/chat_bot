import * as Yup from 'yup';

function isValidCPF(raw: string): boolean {
  const cpf = raw.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) {
      sum += Number(cpf[i]) * (t + 1 - i);
    }
    const digit = ((sum * 10) % 11) % 10;
    if (Number(cpf[t]) !== digit) return false;
  }
  return true;
}

export const loginSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  password: Yup.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .required('Senha é obrigatória')
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .required('Nome é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  cpf: Yup.string()
    .required('CPF é obrigatório')
    .test('cpf-valid', 'CPF inválido', (value) => !!value && isValidCPF(value)),
  phone: Yup.string()
    .required('Telefone é obrigatório')
    .test('phone-valid', 'Telefone inválido', (value) => {
      if (!value) return false;
      const digits = value.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 11;
    }),
  password: Yup.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .matches(/(?=.*[a-zA-Z])/, 'Senha deve conter pelo menos 1 letra')
    .matches(/(?=.*\d)/, 'Senha deve conter pelo menos 1 número')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória')
});

export const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .required('Nome é obrigatório'),
  phone: Yup.string().nullable(),
});

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
});

export const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .matches(/(?=.*[a-zA-Z])/, 'Senha deve conter pelo menos 1 letra')
    .matches(/(?=.*\d)/, 'Senha deve conter pelo menos 1 número')
    .required('Senha é obrigatória'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não coincidem')
    .required('Confirmação de senha é obrigatória')
});

export type LoginFormData = Yup.InferType<typeof loginSchema>;
export type RegisterFormData = Yup.InferType<typeof registerSchema>;
export type ProfileFormData = Yup.InferType<typeof profileSchema>;
export type ForgotPasswordFormData = Yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = Yup.InferType<typeof resetPasswordSchema>;
