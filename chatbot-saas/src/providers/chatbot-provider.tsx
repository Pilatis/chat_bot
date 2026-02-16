'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotContext } from '../context/chatbot-context';
import { ChatbotContextType, ChatMessage, ChatStats, type ChatbotResult } from '../types/chatbot.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

interface ChatbotProviderProps {
  children: React.ReactNode;
  companyId: string;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children, companyId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);

  const { api } = useApi();
  const { showSuccess, showError } = useToast();

  const clearError = (): void => setError(null);

  const clearMessages = (): void => setMessages([]);

  const sendMessage = async (message: string): Promise<void> => {
    if (!message.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Adicionar mensagem do cliente imediatamente
      const clientMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        from: 'CLIENT',
        content: message,
        companyId,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, clientMessage]);

      // Processar mensagem com IA
      const response = await api.post(`/chatbot/${companyId}/message`, { message });
      
      if (response.data?.success && response.data?.data) {
        const { response: aiResponse } = response.data.data;
        
        // Adicionar resposta do bot
        const botMessage: ChatMessage = {
          id: `temp-${Date.now() + 1}`,
          from: 'BOT',
          content: aiResponse,
          companyId,
          createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        const msg = response.data?.message || 'Erro ao processar mensagem';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao processar mensagem';
      showError(msg);
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const trainAI = async (): Promise<ChatbotResult> => {
    try {
      setIsTraining(true);
      setError(null);

      const response = await api.post(`/chatbot/${companyId}/train`);

      if (response.data?.success) {
        showSuccess(response.data?.message || 'IA treinada com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao treinar IA';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao treinar IA';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsTraining(false);
    }
  };

  const getChatHistory = async (limit?: number): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/chatbot/${companyId}/chat-history${limit ? `?limit=${limit}` : ''}`);
      
      if (response.data?.success && response.data?.data) {
        setMessages(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar histórico';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar histórico';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getChatStats = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/chatbot/${companyId}/stats`);
      
      if (response.data?.success && response.data?.data) {
        setStats(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar estatísticas';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar estatísticas';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar histórico e estatísticas quando companyId estiver disponível
  useEffect(() => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    getChatHistory();
    getChatStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const contextValue: ChatbotContextType = {
    messages,
    isLoading,
    isProcessing,
    error,
    stats,
    sendMessage,
    trainAI,
    getChatHistory,
    getChatStats,
    clearMessages,
    clearError,
    // Estado adicional para treinamento
    isTraining
  } as ChatbotContextType;

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
};