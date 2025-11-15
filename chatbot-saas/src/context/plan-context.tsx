'use client';

import { createContext } from 'react';
import { PlanContextType } from '../types/plan.types';

export const PlanContext = createContext<PlanContextType | undefined>(undefined);

