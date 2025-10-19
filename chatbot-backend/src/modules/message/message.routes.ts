import { Router } from 'express';
import { MessageController } from './message.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const messageController = new MessageController();

// Todas as rotas de mensagens requerem autenticação
router.use(authMiddleware);

// Criar mensagem
router.post('/:companyId', messageController.createMessage);

// Obter mensagens com filtros
router.get('/:companyId', messageController.getMessages);

// Obter mensagem específica
router.get('/message/:messageId', messageController.getMessageById);

// Deletar mensagem
router.delete('/message/:messageId', messageController.deleteMessage);

// Estatísticas das mensagens
router.get('/:companyId/stats', messageController.getMessageStats);

// Mensagens recentes
router.get('/:companyId/recent', messageController.getRecentMessages);

export default router;
