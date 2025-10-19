// Tipos para chatbot
export interface ChatMessage {
  id: string;
  from: 'CLIENT' | 'BOT';
  content: string;
  companyId: string;
  createdAt: string;
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
}

export interface ChatStats {
  totalMessages: number;
  todayMessages: number;
  byType: {
    client: number;
    bot: number;
  };
  peakHours: Array<{ hour: number; count: number }>;
}

export interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  stats: ChatStats | null;
}

export interface ChatbotContextType extends ChatbotState {
  sendMessage: (message: string) => Promise<void>;
  trainAI: () => Promise<void>;
  getChatHistory: (limit?: number) => Promise<void>;
  getChatStats: () => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}
