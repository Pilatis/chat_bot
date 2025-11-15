import { Router } from 'express';
import { PlanController } from './plan.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();
const planController = new PlanController();

// Todas as rotas de planos requerem autenticação
router.use(authMiddleware);

// criar plano
router.post('/', planController.createPlan);

// Obter plano atual do usuário autenticado
router.get('/current', planController.getUserPlan);

// Obter todos os planos disponíveis
router.get('/', planController.getAllPlans);

// Atribuir plano ao usuário autenticado
router.post('/assign', planController.assignPlan);

export default router;

