import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.use(authMiddleware);

router.get('/:companyId/overview', companyMiddleware, analyticsController.getOverview);
router.get('/:companyId/messages-by-range', companyMiddleware, analyticsController.getMessagesByTimeRange);
router.get('/:companyId/hourly-distribution', companyMiddleware, analyticsController.getHourlyDistribution);
router.get('/:companyId/top-keywords', companyMiddleware, analyticsController.getTopKeywords);
router.get('/:companyId/dashboard', companyMiddleware, analyticsController.getDashboardData);

export default router;
