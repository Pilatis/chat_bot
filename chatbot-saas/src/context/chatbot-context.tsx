'use client';

import { createContext } from 'react';
import { ChatbotContextType } from '../types/chatbot.types';

export const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

