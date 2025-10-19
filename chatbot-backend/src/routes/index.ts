import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import companyRoutes from '../modules/company/company.routes';
import chatbotRoutes from '../modules/chatbot/chatbot.routes';
import messageRoutes from '../modules/message/message.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';

const router = Router();

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de empresa
router.use('/company', companyRoutes);

// Rotas de chatbot
router.use('/chatbot', chatbotRoutes);

// Rotas de mensagens
router.use('/messages', messageRoutes);

// Rotas de analytics
router.use('/analytics', analyticsRoutes);

// Rota de health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
