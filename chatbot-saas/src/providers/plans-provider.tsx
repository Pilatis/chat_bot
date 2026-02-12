'use client';

import React, { useState, useEffect } from 'react';
import { PlanContext } from '../context/plan-context';
import { PlanContextType, UserPlan, Plan, CreatePlanData, type PlanResult } from '../types/plan.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

export const PlansProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showSuccess, showError } = useToast();

  const clearError = (): void => setError(null);

  const createPlan = async (data: CreatePlanData): Promise<Plan | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/plan', data);

      if (response.data?.success) {
        const newPlan = response.data.data;
        setAllPlans(prev => [...prev, newPlan]);
        return newPlan;
      }
      const msg = response.data?.message || 'Erro ao criar plano';
      showError(msg);
      setError(msg);
      return null;
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao criar plano';
      showError(msg);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserPlan = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/plan/current');
      
      if (response.data?.success) {
        setCurrentPlan(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar plano atual';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar plano atual';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const assignPlan = async (planId: string): Promise<PlanResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/plan/assign', { planId });

      if (response.data?.success) {
        const updatedPlan = response.data.data;
        setCurrentPlan(updatedPlan);
        await Promise.all([getAllPlans(), getUserPlan()]);
        showSuccess(response.data?.message || 'Plano atribuído com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao atribuir plano';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao atribuir plano';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const getAllPlans = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/plan');
      
      if (response.data?.success) {
        setAllPlans(response.data.data || []);
      } else {
        const msg = response.data?.message || 'Erro ao carregar planos';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar planos';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPlans = async (): Promise<void> => {
    await Promise.all([getUserPlan()]);
  };

  // Carregar planos ao montar o componente
  useEffect(() => {
    refreshPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contextValue: PlanContextType = {
    currentPlan,
    allPlans,
    isLoading,
    error,
    createPlan,
    assignPlan,
    getUserPlan,
    getAllPlans,
    refreshPlans,
    clearError
  };

  return (
    <PlanContext.Provider value={contextValue}>
      {children}
    </PlanContext.Provider>
  );
};
