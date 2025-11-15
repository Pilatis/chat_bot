import { PrismaClient } from '@prisma/client';

// Enums serão importados diretamente quando o Prisma Client for regenerado corretamente
enum PlanTypes {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO'
}

enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED'
}

const prisma = new PrismaClient();

export interface UserPlanResponse {
  planType: PlanTypes;
  name: string;
  price: number;
  limitMessages: number;
  startedAt: Date;
  expiresAt: Date | null;
  status: SubscriptionStatus;
  benefits: string[];
}

export interface PlanResponse {
  id: string;
  name: string;
  planType: PlanTypes;
  price: number;
  limitMessages: number;
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PlanService {
  async createPlan(name: string, planType: PlanTypes, price: number, limitMessages: number, benefits: string[] = []): Promise<PlanResponse> {
    const plan = await prisma.plan.create({
      data: { 
        name, 
        planType: planType as PlanTypes,
        price, 
        limitMessages,
        benefits
      },
      select: {
        id: true,
        name: true,
        planType: true,
        price: true,
        limitMessages: true,
        benefits: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return {
      id: plan.id,
      name: plan.name,
      planType: plan.planType as PlanTypes,
      price: plan.price,
      limitMessages: plan.limitMessages,
      benefits: plan.benefits || [],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }

  async getUserPlan(userId: string): Promise<UserPlanResponse> {
    // Buscar UserPlan do usuário com informações do Plan
    const userPlan = await prisma.userPlan.findUnique({
      where: { userId },
      include: {
        plan: true,
        user: {
          select: {
            planType: true
          }
        }
      }
    });

    if (!userPlan) {
      // Se não tiver UserPlan, buscar o plano FREE padrão
      const freePlan = await prisma.plan.findFirst({
        where: {
          name: {
            contains: 'FREE',
            mode: 'insensitive'
          }
        }
      });

      if (!freePlan) {
        throw new Error('Plano padrão não encontrado');
      }

      return {
        planType: PlanTypes.FREE,
        name: freePlan.name,
        price: freePlan.price,
        limitMessages: freePlan.limitMessages,
        startedAt: new Date(),
        expiresAt: null,
        status: SubscriptionStatus.ACTIVE,
        benefits: freePlan.benefits || []
      };
    }

    // Buscar subscription ativa da empresa do usuário (se houver)
    // Por enquanto, retornamos baseado no UserPlan
    return {
      planType: userPlan.planType as PlanTypes,
      name: userPlan.plan.name,
      price: userPlan.plan.price,
      limitMessages: userPlan.plan.limitMessages,
      startedAt: userPlan.createdAt,
      expiresAt: null, // Pode ser obtido de Subscription se necessário
      status: SubscriptionStatus.ACTIVE,
      benefits: userPlan.plan.benefits || []
    };
  }

  async assignPlan(userId: string, planId: string): Promise<UserPlanResponse> {
    // Buscar o plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Verificar se o usuário já tem um UserPlan
    const existingUserPlan = await prisma.userPlan.findUnique({
      where: { userId }
    });

    if (existingUserPlan) {
      // Atualizar UserPlan existente
      const updatedUserPlan = await prisma.userPlan.update({
        where: { userId },
        data: {
          planId: plan.id,
          planType: plan.planType as PlanTypes
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              planType: true,
              price: true,
              limitMessages: true,
              benefits: true
            }
          }
        }
      });

      // Atualizar planType do User
      await prisma.user.update({
        where: { id: userId },
        data: {
          planType: plan.planType as PlanTypes
        }
      });

      return {
        planType: updatedUserPlan.planType as PlanTypes,
        name: updatedUserPlan.plan.name,
        price: updatedUserPlan.plan.price,
        limitMessages: updatedUserPlan.plan.limitMessages,
        startedAt: updatedUserPlan.createdAt,
        expiresAt: null,
        status: SubscriptionStatus.ACTIVE,
        benefits: updatedUserPlan.plan.benefits || []
      };
    } else {
      // Criar novo UserPlan
      const newUserPlan = await prisma.userPlan.create({
        data: {
          userId,
          planId: plan.id,
          planType: plan.planType as PlanTypes
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              planType: true,
              price: true,
              limitMessages: true,
              benefits: true
            }
          }
        }
      });

      // Atualizar planType do User
      await prisma.user.update({
        where: { id: userId },
        data: {
          planType: plan.planType as PlanTypes
        }
      });

      return {
        planType: newUserPlan.planType as PlanTypes,
        name: newUserPlan.plan.name,
        price: newUserPlan.plan.price,
        limitMessages: newUserPlan.plan.limitMessages,
        startedAt: newUserPlan.createdAt,
        expiresAt: null,
        status: SubscriptionStatus.ACTIVE,
        benefits: newUserPlan.plan.benefits || []
      };
    }
  }

  async getAllPlans(): Promise<PlanResponse[]> {
    const plans = await prisma.plan.findMany({
      select: {
        id: true,
        name: true,
        planType: true,
        price: true,
        limitMessages: true,
        benefits: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    return plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      planType: plan.planType as PlanTypes,
      price: plan.price,
      limitMessages: plan.limitMessages,
      benefits: plan.benefits || [],
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    }));
  }
}

