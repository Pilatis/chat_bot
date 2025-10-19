import { Router } from 'express';
import { ChatbotController } from './chatbot.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const chatbotController = new ChatbotController();

// Todas as rotas de chatbot requerem autenticação
router.use(authMiddleware);

// Processar mensagem do cliente
router.post('/:companyId/message', chatbotController.processMessage);

// Treinar IA com dados da empresa
router.post('/:companyId/train', chatbotController.trainAI);

// Obter histórico de treinamento
router.get('/:companyId/training-history', chatbotController.getTrainingHistory);

// Obter histórico de conversas
router.get('/:companyId/chat-history', chatbotController.getChatHistory);

// Obter estatísticas do chat
router.get('/:companyId/stats', chatbotController.getChatStats);

export default router;
