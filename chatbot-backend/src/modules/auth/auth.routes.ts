import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { adminMiddleware } from '../../middlewares/adminMiddleware';

const router = Router();
const authController = new AuthController();

// Rotas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Rotas protegidas
router.get('/profile', authMiddleware, authController.getProfile);

// Exemplo de rota apenas para admin (descomente e implemente conforme necessário)
// router.get('/admin/users', authMiddleware, adminMiddleware, authController.getAllUsers);

export default router;
