'use client';

import React, { useState, useEffect } from 'react';
import { PlanContext } from '../context/plan-context';
import { PlanContextType, UserPlan, Plan, CreatePlanData } from '../types/plan.types';
import { useApi } from '../hooks/use-api';

export const PlansProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();

  const clearError = (): void => setError(null);

  const createPlan = async (data: CreatePlanData): Promise<Plan> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/plan', data);
      
      if (response.data?.success) {
        const newPlan = response.data.data;
        // Atualizar lista de planos
        setAllPlans(prev => [...prev, newPlan]);
        return newPlan;
      } else {
        throw new Error(response.data?.message || 'Erro ao criar plano');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar plano');
      throw err;
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
        setError(response.data?.message || 'Erro ao carregar plano atual');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar plano atual');
    } finally {
      setIsLoading(false);
    }
  };

  const assignPlan = async (planId: string): Promise<UserPlan> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/plan/assign', { planId });
      
      if (response.data?.success) {
        const updatedPlan = response.data.data;
        setCurrentPlan(updatedPlan);
        // Recarregar planos e plano atual para garantir sincronização
        await Promise.all([getAllPlans(), getUserPlan()]);
        return updatedPlan;
      } else {
        throw new Error(response.data?.message || 'Erro ao atribuir plano');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao atribuir plano');
      throw err;
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
        setError(response.data?.message || 'Erro ao carregar planos');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar planos');
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
