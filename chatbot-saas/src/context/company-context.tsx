'use client';

import { createContext } from 'react';
import { CompanyContextType } from '../types/company.types';

export const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

