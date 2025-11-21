import { Response } from 'express';
import { whatsappService } from './whatsapp.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class WhatsAppController {
  createSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId, sessionName } = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const result = await whatsappService.createSession(companyId, sessionName);
      return successResponse(res, 'Sessão criada com sucesso. Escaneie o QR Code para conectar.', result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getQRCode = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionName } = req.params;

      if (!sessionName) {
        return errorResponse(res, 'Nome da sessão é obrigatório', 400);
      }

      const qrCode = await whatsappService.getQRCode(sessionName);
      
      if (!qrCode) {
        return errorResponse(res, 'QR Code não disponível ou sessão já conectada', 404);
      }

      return successResponse(res, 'QR Code obtido com sucesso', { qrCode });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getSessionStatus = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionName } = req.params;

      if (!sessionName) {
        return errorResponse(res, 'Nome da sessão é obrigatório', 400);
      }

      const status = await whatsappService.getSessionStatus(sessionName);
      const isConnected = whatsappService.isSessionConnected(sessionName);

      return successResponse(res, 'Status obtido com sucesso', {
        sessionName,
        status: status || 'NOT_FOUND',
        isConnected
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { sessionName, phoneNumber, message } = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!sessionName || !phoneNumber || !message) {
        return errorResponse(res, 'Nome da sessão, número de telefone e mensagem são obrigatórios', 400);
      }

      await whatsappService.sendMessage(sessionName, phoneNumber, message);
      return successResponse(res, 'Mensagem enviada com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  disconnectSession = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionName } = req.params;

      if (!sessionName) {
        return errorResponse(res, 'Nome da sessão é obrigatório', 400);
      }

      await whatsappService.disconnectSession(sessionName);
      return successResponse(res, 'Sessão desconectada com sucesso');
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getAllSessions = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const sessions = await whatsappService.getAllSessions();
      const sessionsWithStatus = await whatsappService.getAllSessionsWithStatus();
      return successResponse(res, 'Sessões obtidas com sucesso', { 
        sessions,
        sessionsWithStatus 
      });
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}

