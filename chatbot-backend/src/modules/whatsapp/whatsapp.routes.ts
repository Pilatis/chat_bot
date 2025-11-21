import { Router } from 'express';
import { WhatsAppController } from './whatsapp.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const whatsappController = new WhatsAppController();

// Todas as rotas de WhatsApp requerem autenticação
router.use(authMiddleware);

// Criar nova sessão do WhatsApp
router.post('/session', whatsappController.createSession);

// Obter QR Code de uma sessão
router.get('/session/:sessionName/qrcode', whatsappController.getQRCode);

// Obter status de uma sessão
router.get('/session/:sessionName/status', whatsappController.getSessionStatus);

// Desconectar sessão
router.delete('/session/:sessionName', whatsappController.disconnectSession);

// Listar todas as sessões
router.get('/sessions', whatsappController.getAllSessions);

// Enviar mensagem via WhatsApp
router.post('/send-message', whatsappController.sendMessage);

export default router;


