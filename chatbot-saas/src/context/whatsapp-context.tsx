'use client';

import { createContext } from 'react';
import { WhatsAppContextType } from '../types/whatsapp.types';

export const WhatsAppContext = createContext<WhatsAppContextType | undefined>(undefined);


