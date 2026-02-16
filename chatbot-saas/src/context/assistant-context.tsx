'use client';

import { createContext } from 'react';
import { AssistantContextType } from '../types/assistant.types';

export const AssistantContext = createContext<AssistantContextType | undefined>(undefined);
