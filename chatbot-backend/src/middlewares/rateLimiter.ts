import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas tentativas de registro. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Muitas solicitações. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Muitas solicitações de reenvio. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
