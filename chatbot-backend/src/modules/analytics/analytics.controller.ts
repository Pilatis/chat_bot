import { Response } from 'express';
import { AnalyticsService, TimeRange, PeriodFilter } from './analytics.service';
import { successResponse, errorResponse } from '../../utils/response';
import { TenantRequest } from '../../middlewares/companyMiddleware';

const VALID_PERIODS: PeriodFilter[] = ['today', '7', '14', '30'];

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  getOverview = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const period = (req.query['period'] as PeriodFilter) || '7';

      if (!VALID_PERIODS.includes(period)) {
        return errorResponse(res, 'Período inválido. Use: today, 7, 14 ou 30', 400);
      }

      const overview = await this.analyticsService.getOverview(req.company!.id, userId, period);
      return successResponse(res, 'Visão geral obtida com sucesso', overview);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter visão geral';
      return errorResponse(res, msg, 500);
    }
  };

  getMessagesByTimeRange = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return errorResponse(res, 'Data de início e fim são obrigatórias', 400);
      }

      const timeRange: TimeRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };

      const result = await this.analyticsService.getMessagesByTimeRange(req.company!.id, userId, timeRange);
      return successResponse(res, 'Mensagens por período obtidas com sucesso', result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter mensagens por período';
      return errorResponse(res, msg, 500);
    }
  };

  getHourlyDistribution = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const period = (req.query['period'] as PeriodFilter) || '7';

      if (!VALID_PERIODS.includes(period)) {
        return errorResponse(res, 'Período inválido. Use: today, 7, 14 ou 30', 400);
      }

      const distribution = await this.analyticsService.getHourlyDistribution(req.company!.id, userId, period);
      return successResponse(res, 'Distribuição horária obtida com sucesso', distribution);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter distribuição horária';
      return errorResponse(res, msg, 500);
    }
  };

  getTopKeywords = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const limit = parseInt(req.query['limit'] as string) || 10;
      const period = (req.query['period'] as PeriodFilter) || '7';

      if (!VALID_PERIODS.includes(period)) {
        return errorResponse(res, 'Período inválido. Use: today, 7, 14 ou 30', 400);
      }

      const keywords = await this.analyticsService.getTopKeywords(req.company!.id, userId, limit, period);
      return successResponse(res, 'Palavras-chave obtidas com sucesso', keywords);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter palavras-chave';
      return errorResponse(res, msg, 500);
    }
  };

  getDashboardData = async (req: TenantRequest, res: Response) => {
    try {
      const userId = req.user!.userId;
      const period = (req.query['period'] as PeriodFilter) || '7';

      if (!VALID_PERIODS.includes(period)) {
        return errorResponse(res, 'Período inválido. Use: today, 7, 14 ou 30', 400);
      }

      const [overview, hourlyDistribution, topKeywords] = await Promise.all([
        this.analyticsService.getOverview(req.company!.id, userId, period),
        this.analyticsService.getHourlyDistribution(req.company!.id, userId, period),
        this.analyticsService.getTopKeywords(req.company!.id, userId, 5, period)
      ]);

      return successResponse(res, 'Dados do dashboard obtidos com sucesso', {
        overview,
        hourlyDistribution,
        topKeywords
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter dados do dashboard';
      return errorResponse(res, msg, 500);
    }
  };
}
