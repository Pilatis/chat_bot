import { Response } from 'express';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
  }

  processMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const { message }: ChatMessage = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId || !companyId.trim()) {
        return errorResponse(res, 'ID da empresa é obrigatório. Use a URL: POST /api/chatbot/SEU_UUID_DA_EMPRESA/message', 400);
      }
      // Rejeitar placeholder literal (ex.: alguém testando com "companyId" na URL)
      if (companyId.toLowerCase() === 'companyid') {
        return errorResponse(res, 'Substitua "companyId" pelo ID real da empresa (UUID). Ex: POST /api/chatbot/abc123-uuid/message', 400);
      }

      if (!message || message.trim().length === 0) {
        return errorResponse(res, 'Mensagem é obrigatória', 400);
      }

      const response = await this.chatbotService.processMessage(companyId, userId, { message });
      return successResponse(res, 'Mensagem processada com sucesso', response);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  trainAI = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const result = await this.chatbotService.trainAI(companyId, userId);
      return successResponse(res, result.message, result.trainedData);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getTrainingHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const history = await this.chatbotService.getTrainingHistory(companyId, userId);
      return successResponse(res, 'Histórico de treinamento obtido com sucesso', history);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const limit = parseInt(req.query['limit'] as string) || 50;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const history = await this.chatbotService.getChatHistory(companyId, userId, limit);
      return successResponse(res, 'Histórico de chat obtido com sucesso', history);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getChatStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const stats = await this.chatbotService.getChatStats(companyId, userId);
      return successResponse(res, 'Estatísticas do chat obtidas com sucesso', stats);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}
