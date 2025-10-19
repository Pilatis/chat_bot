'use client';

import { createContext } from 'react';
import { AnalyticsContextType } from '../types/analytics.types';

export const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

