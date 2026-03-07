import { Router } from 'express';
import { MessageController } from './message.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const messageController = new MessageController();

router.use(authMiddleware);

router.post('/:companyId', companyMiddleware, messageController.createMessage);
router.get('/:companyId', companyMiddleware, messageController.getMessages);
router.get('/:companyId/stats', companyMiddleware, messageController.getMessageStats);
router.get('/:companyId/recent', companyMiddleware, messageController.getRecentMessages);
router.get('/:companyId/message/:messageId', companyMiddleware, messageController.getMessageById);
router.delete('/:companyId/message/:messageId', companyMiddleware, messageController.deleteMessage);

export default router;
