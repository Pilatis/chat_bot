import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import companyRoutes from '../modules/company/company.routes';
import assistantRoutes from '../modules/assistant/assistant.routes';
import chatbotRoutes from '../modules/chatbot/chatbot.routes';
import messageRoutes from '../modules/message/message.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import planRoutes from '../modules/plan/plan.routes';
import whatsappRoutes from '../modules/whatsapp/whatsapp.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/company', assistantRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/messages', messageRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/plan', planRoutes);
router.use('/whatsapp', whatsappRoutes);

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando',
    timestamp: new Date().toISOString()
  });
});

export default router;
