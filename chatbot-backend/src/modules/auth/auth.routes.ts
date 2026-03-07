import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { loginLimiter, registerLimiter, forgotPasswordLimiter, resendVerificationLimiter } from '../../middlewares/rateLimiter';

const router = Router();
const authController = new AuthController();

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, authController.resendVerification);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

export default router;
