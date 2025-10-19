import { Request, Response } from 'express';
import { AnalyticsService, TimeRange } from './analytics.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getOverview = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const overview = await this.analyticsService.getOverview(companyId, userId);
      return successResponse(res, 'Visão geral obtida com sucesso', overview);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getMessagesByTimeRange = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      if (!startDate || !endDate) {
        return errorResponse(res, 'Data de início e fim são obrigatórias', 400);
      }

      const timeRange: TimeRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const result = await this.analyticsService.getMessagesByTimeRange(companyId, userId, timeRange);
      return successResponse(res, 'Mensagens por período obtidas com sucesso', result);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getHourlyDistribution = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const distribution = await this.analyticsService.getHourlyDistribution(companyId, userId);
      return successResponse(res, 'Distribuição horária obtida com sucesso', distribution);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getTopKeywords = async (req: AuthenticatedRequest, res: Response) => {
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

      const keywords = await this.analyticsService.getTopKeywords(companyId, userId, limit);
      return successResponse(res, 'Palavras-chave obtidas com sucesso', keywords);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      // Obter todos os dados do dashboard em paralelo
      const [overview, hourlyDistribution, topKeywords] = await Promise.all([
        this.analyticsService.getOverview(companyId, userId),
        this.analyticsService.getHourlyDistribution(companyId, userId),
        this.analyticsService.getTopKeywords(companyId, userId, 5)
      ]);

      const dashboardData = {
        overview,
        hourlyDistribution,
        topKeywords
      };

      return successResponse(res, 'Dados do dashboard obtidos com sucesso', dashboardData);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}
