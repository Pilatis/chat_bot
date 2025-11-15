import { Response } from 'express';
import { PlanService } from './plan.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

interface CreatePlanData {
    name: string;
    planType: string;
    price: number;
    limitMessages: number;
    benefits?: string[];
}

export class PlanController {
  private planService: PlanService;

  constructor() {
    this.planService = new PlanService();
  }

  createPlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, planType, price, limitMessages, benefits = [] }: CreatePlanData = req.body;
      
      if (!name || !planType || price === undefined || limitMessages === undefined) {
        return errorResponse(res, 'Nome, tipo de plano, preço e limite de mensagens são obrigatórios', 400);
      }

      const plan = await this.planService.createPlan(name, planType as any, price, limitMessages, benefits);
      return successResponse(res, 'Plano criado com sucesso', plan);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getUserPlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      const userPlan = await this.planService.getUserPlan(userId);
      return successResponse(res, 'Plano obtido com sucesso', userPlan);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getAllPlans = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const plans = await this.planService.getAllPlans();
      return successResponse(res, 'Planos obtidos com sucesso', plans);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  assignPlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { planId } = req.body;
      
      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!planId) {
        return errorResponse(res, 'ID do plano é obrigatório', 400);
      }

      const userPlan = await this.planService.assignPlan(userId, planId);
      return successResponse(res, 'Plano atribuído com sucesso', userPlan);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}

