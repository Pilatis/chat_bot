import { Response } from 'express';
import { MessageService, CreateMessageData, MessageFilters } from './message.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

enum MessageFrom {
  CLIENT = 'CLIENT',
  BOT = 'BOT'
}

export class MessageController {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  createMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const { from, content }: CreateMessageData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      if (!from || !content) {
        return errorResponse(res, 'Tipo de mensagem e conteúdo são obrigatórios', 400);
      }

      if (!Object.values(MessageFrom).includes(from)) {
        return errorResponse(res, 'Tipo de mensagem inválido', 400);
      }

      const message = await this.messageService.createMessage(companyId, userId, { from, content });
      return successResponse(res, 'Mensagem criada com sucesso', message, 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const { from, startDate, endDate, limit, offset } = req.query;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const filters: MessageFilters = {};

      if (from && Object.values(MessageFrom).includes(from as MessageFrom)) {
        filters.from = from as MessageFrom;
      }

      if (startDate) {
        filters.startDate = new Date(startDate as string);
      }

      if (endDate) {
        filters.endDate = new Date(endDate as string);
      }

      if (limit) {
        filters.limit = parseInt(limit as string);
      }

      if (offset) {
        filters.offset = parseInt(offset as string);
      }

      const messages = await this.messageService.getMessages(companyId, userId, filters);
      return successResponse(res, 'Mensagens obtidas com sucesso', messages);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getMessageById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { messageId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!messageId) {
        return errorResponse(res, 'ID da mensagem é obrigatório', 400);
      }

      const message = await this.messageService.getMessageById(messageId, userId);
      return successResponse(res, 'Mensagem obtida com sucesso', message);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  deleteMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { messageId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!messageId) {
        return errorResponse(res, 'ID da mensagem é obrigatório', 400);
      }

      const result = await this.messageService.deleteMessage(messageId, userId);
      return successResponse(res, result.message, null);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getMessageStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const stats = await this.messageService.getMessageStats(companyId, userId);
      return successResponse(res, 'Estatísticas das mensagens obtidas com sucesso', stats);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getRecentMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const limit = parseInt(req.query['limit'] as string) || 10;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const messages = await this.messageService.getRecentMessages(companyId, userId, limit);
      return successResponse(res, 'Mensagens recentes obtidas com sucesso', messages);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}
