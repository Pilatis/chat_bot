import { Response } from 'express';
import { whatsappService } from './whatsapp.service';
import { successResponse, errorResponse } from '../../utils/response';
import { TenantRequest } from '../../middlewares/companyMiddleware';

export class WhatsAppController {
  createSession = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const { sessionName } = req.body;

      const result = await whatsappService.createSession(companyId, sessionName);
      return successResponse(res, 'Sessão criada com sucesso. Escaneie o QR Code para conectar.', result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar sessão';
      return errorResponse(res, msg, 500);
    }
  };

  getQRCode = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const { sessionName } = req.params;

      if (!sessionName) return errorResponse(res, 'Nome da sessão é obrigatório', 400);

      if (!whatsappService.isSessionOwnedByCompany(sessionName, companyId)) {
        return errorResponse(res, 'Sessão não pertence a esta empresa', 403);
      }

      const qrCode = await whatsappService.getQRCode(sessionName);
      if (!qrCode) return errorResponse(res, 'QR Code não disponível ou sessão já conectada', 404);

      return successResponse(res, 'QR Code obtido com sucesso', { qrCode });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter QR Code';
      return errorResponse(res, msg, 500);
    }
  };

  getSessionStatus = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const { sessionName } = req.params;

      if (!sessionName) return errorResponse(res, 'Nome da sessão é obrigatório', 400);

      if (!whatsappService.isSessionOwnedByCompany(sessionName, companyId)) {
        return errorResponse(res, 'Sessão não pertence a esta empresa', 403);
      }

      const status = await whatsappService.getSessionStatus(sessionName);
      const isConnected = whatsappService.isSessionConnected(sessionName);

      return successResponse(res, 'Status obtido com sucesso', {
        sessionName,
        status: status || 'NOT_FOUND',
        isConnected
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter status';
      return errorResponse(res, msg, 500);
    }
  };

  sendMessage = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const { sessionName, phoneNumber, message } = req.body;

      if (!sessionName || !phoneNumber || !message) {
        return errorResponse(res, 'Nome da sessão, número de telefone e mensagem são obrigatórios', 400);
      }

      if (!whatsappService.isSessionOwnedByCompany(sessionName, companyId)) {
        return errorResponse(res, 'Sessão não pertence a esta empresa', 403);
      }

      await whatsappService.sendMessage(sessionName, phoneNumber, message);
      return successResponse(res, 'Mensagem enviada com sucesso');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao enviar mensagem';
      return errorResponse(res, msg, 500);
    }
  };

  disconnectSession = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const { sessionName } = req.params;

      if (!sessionName) return errorResponse(res, 'Nome da sessão é obrigatório', 400);

      if (!whatsappService.isSessionOwnedByCompany(sessionName, companyId)) {
        return errorResponse(res, 'Sessão não pertence a esta empresa', 403);
      }

      await whatsappService.disconnectSession(sessionName);
      return successResponse(res, 'Sessão desconectada com sucesso');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao desconectar sessão';
      return errorResponse(res, msg, 500);
    }
  };

  getSessions = async (req: TenantRequest, res: Response) => {
    try {
      const companyId = req.company!.id;
      const sessions = await whatsappService.getSessionsByCompany(companyId);
      return successResponse(res, 'Sessões obtidas com sucesso', { sessions });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar sessões';
      return errorResponse(res, msg, 500);
    }
  };
}
