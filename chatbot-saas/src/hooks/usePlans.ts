import { useContext } from 'react';
import { PlanContext } from '../context/plan-context';
import { PlanContextType } from '../types/plan.types';

// Hook para usar planos
export const usePlans = (): PlanContextType => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlans deve ser usado dentro de um PlansProvider');
  }
  return context;
};

