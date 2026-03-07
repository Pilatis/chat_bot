import { Response } from 'express';
import { MessageService, CreateMessageData, MessageFilters } from './message.service';
import { successResponse, errorResponse } from '../../utils/response';
import { TenantRequest } from '../../middlewares/companyMiddleware';

enum MessageFrom {
  CLIENT = 'CLIENT',
  BOT = 'BOT'
}

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  createMessage = async (req: TenantRequest, res: Response) => {
    try {
      const { from, content }: CreateMessageData = req.body;

      if (!from || !content) {
        return errorResponse(res, 'Tipo de mensagem e conteúdo são obrigatórios', 400);
      }
      if (!Object.values(MessageFrom).includes(from)) {
        return errorResponse(res, 'Tipo de mensagem inválido', 400);
      }

      const message = await this.messageService.createMessage(req.company!.id, { from, content });
      return successResponse(res, 'Mensagem criada com sucesso', message, 201);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar mensagem';
      return errorResponse(res, msg, 500);
    }
  };

  getMessages = async (req: TenantRequest, res: Response) => {
    try {
      const { from, startDate, endDate, limit, offset } = req.query;

      const filters: MessageFilters = {};
      if (from && Object.values(MessageFrom).includes(from as MessageFrom)) {
        filters.from = from as MessageFrom;
      }
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const messages = await this.messageService.getMessages(req.company!.id, filters);
      return successResponse(res, 'Mensagens obtidas com sucesso', messages);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar mensagens';
      return errorResponse(res, msg, 500);
    }
  };

  getMessageById = async (req: TenantRequest, res: Response) => {
    try {
      const { messageId } = req.params;
      if (!messageId) return errorResponse(res, 'ID da mensagem é obrigatório', 400);

      const message = await this.messageService.getMessageById(messageId, req.company!.id);
      return successResponse(res, 'Mensagem obtida com sucesso', message);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao buscar mensagem';
      const status = msg.includes('não encontrad') ? 404 : 500;
      return errorResponse(res, msg, status);
    }
  };

  deleteMessage = async (req: TenantRequest, res: Response) => {
    try {
      const { messageId } = req.params;
      if (!messageId) return errorResponse(res, 'ID da mensagem é obrigatório', 400);

      const result = await this.messageService.deleteMessage(messageId, req.company!.id);
      return successResponse(res, result.message, null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao deletar mensagem';
      const status = msg.includes('não encontrad') ? 404 : 500;
      return errorResponse(res, msg, status);
    }
  };

  getMessageStats = async (req: TenantRequest, res: Response) => {
    try {
      const stats = await this.messageService.getMessageStats(req.company!.id);
      return successResponse(res, 'Estatísticas das mensagens obtidas com sucesso', stats);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      return errorResponse(res, msg, 500);
    }
  };

  getRecentMessages = async (req: TenantRequest, res: Response) => {
    try {
      const limit = parseInt(req.query['limit'] as string) || 10;
      const messages = await this.messageService.getRecentMessages(req.company!.id, limit);
      return successResponse(res, 'Mensagens recentes obtidas com sucesso', messages);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter mensagens recentes';
      return errorResponse(res, msg, 500);
    }
  };
}
