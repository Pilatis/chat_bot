// Tipos para planos
export type PlanTypes = 'FREE' | 'BASIC' | 'PRO';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED';

export interface UserPlan {
  planType: PlanTypes;
  name: string;
  price: number;
  limitMessages: number;
  startedAt: string;
  expiresAt: string | null;
  status: SubscriptionStatus;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  limitMessages: number;
  createdAt: string;
  benefits: string[];
  planType: PlanTypes;
}

export interface CreatePlanData {
  name: string;
  price: number;
  limitMessages: number;
}

export interface PlanState {
  currentPlan: UserPlan | null;
  allPlans: Plan[];
  isLoading: boolean;
  error: string | null;
}

export type PlanResult = 'success' | 'failure' | void;

export interface PlanContextType extends PlanState {
  createPlan: (data: CreatePlanData) => Promise<Plan | null>;
  assignPlan: (planId: string) => Promise<PlanResult>;
  getUserPlan: (showToast?: boolean) => Promise<void>;
  getAllPlans: (showToast?: boolean) => Promise<void>;
  refreshPlans: () => Promise<void>;
  clearError: () => void;
}
