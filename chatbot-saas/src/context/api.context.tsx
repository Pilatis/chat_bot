'use client';

import React, { createContext } from 'react';
import { ApiContextType } from '../types/api.types';

export const ApiContext = createContext<ApiContextType>({} as ApiContextType);

