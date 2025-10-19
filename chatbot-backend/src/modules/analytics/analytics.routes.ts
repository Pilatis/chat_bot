import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const analyticsController = new AnalyticsController();

// Todas as rotas de analytics requerem autenticação
router.use(authMiddleware);

// Visão geral das estatísticas
router.get('/:companyId/overview', analyticsController.getOverview);

// Mensagens por período
router.get('/:companyId/messages-by-range', analyticsController.getMessagesByTimeRange);

// Distribuição horária
router.get('/:companyId/hourly-distribution', analyticsController.getHourlyDistribution);

// Palavras-chave mais mencionadas
router.get('/:companyId/top-keywords', analyticsController.getTopKeywords);

// Dados completos do dashboard
router.get('/:companyId/dashboard', analyticsController.getDashboardData);

export default router;
