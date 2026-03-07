import { Response } from 'express';
import { ChatbotService, ChatMessage } from './chatbot.service';
import { successResponse, errorResponse } from '../../utils/response';
import { TenantRequest } from '../../middlewares/companyMiddleware';

export class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
  }

  processMessage = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { message }: ChatMessage = req.body;

      if (!message || message.trim().length === 0) {
        return errorResponse(res, 'Mensagem é obrigatória', 400);
      }

      const response = await this.chatbotService.processMessage(req.company!.id, userId, { message });
      return successResponse(res, 'Mensagem processada com sucesso', response);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao processar mensagem';
      return errorResponse(res, msg, 500);
    }
  };

  trainAI = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const result = await this.chatbotService.trainAI(req.company!.id, userId);
      return successResponse(res, result.message, result.trainedData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao treinar IA';
      return errorResponse(res, msg, 500);
    }
  };

  getTrainingHistory = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const history = await this.chatbotService.getTrainingHistory(req.company!.id, userId);
      return successResponse(res, 'Histórico de treinamento obtido com sucesso', history);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter histórico';
      return errorResponse(res, msg, 500);
    }
  };

  getChatHistory = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query['limit'] as string) || 50;
      const history = await this.chatbotService.getChatHistory(req.company!.id, userId, limit);
      return successResponse(res, 'Histórico de chat obtido com sucesso', history);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter histórico';
      return errorResponse(res, msg, 500);
    }
  };

  getChatStats = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const stats = await this.chatbotService.getChatStats(req.company!.id, userId);
      return successResponse(res, 'Estatísticas do chat obtidas com sucesso', stats);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      return errorResponse(res, msg, 500);
    }
  };
}
