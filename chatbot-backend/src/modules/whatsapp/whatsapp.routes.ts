import { Router } from 'express';
import { WhatsAppController } from './whatsapp.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const whatsappController = new WhatsAppController();

router.use(authMiddleware);

router.post('/:companyId/session', companyMiddleware, whatsappController.createSession);
router.get('/:companyId/session/:sessionName/qrcode', companyMiddleware, whatsappController.getQRCode);
router.get('/:companyId/session/:sessionName/status', companyMiddleware, whatsappController.getSessionStatus);
router.delete('/:companyId/session/:sessionName', companyMiddleware, whatsappController.disconnectSession);
router.get('/:companyId/sessions', companyMiddleware, whatsappController.getSessions);
router.post('/:companyId/send-message', companyMiddleware, whatsappController.sendMessage);

export default router;
