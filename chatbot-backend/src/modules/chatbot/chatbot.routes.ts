import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const chatbotController = new ChatbotController();

router.use(authMiddleware);

router.post('/:companyId/message', companyMiddleware, chatbotController.processMessage);
router.post('/:companyId/train', companyMiddleware, chatbotController.trainAI);
router.get('/:companyId/training-history', companyMiddleware, chatbotController.getTrainingHistory);
router.get('/:companyId/chat-history', companyMiddleware, chatbotController.getChatHistory);
router.get('/:companyId/stats', companyMiddleware, chatbotController.getChatStats);

export default router;
