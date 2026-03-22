/**
 * Rotas públicas do fluxo de autenticação (App Router).
 * Manter em sync com `next.config.mjs` (redirects das URLs antigas).
 */
export const AUTH_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
  verifyEmailConfirm: '/auth/verify-email/confirm',
  termosDeUso: '/auth/termos-de-uso',
} as const;
