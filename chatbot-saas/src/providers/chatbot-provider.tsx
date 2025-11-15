'use client';

import React, { useState, useEffect } from 'react';
import { ChatbotContext } from '../context/chatbot-context';
import { ChatbotContextType, ChatMessage, ChatStats } from '../types/chatbot.types';
import { useApi } from '../hooks/use-api';

interface ChatbotProviderProps {
  children: React.ReactNode;
  companyId: string;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children, companyId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Inicia como true para carregamento inicial
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ChatStats | null>(null);
  
  const { api } = useApi();

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
        throw new Error(response.data?.message || 'Erro ao processar mensagem');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const trainAI = async (): Promise<void> => {
    try {
      setIsTraining(true);
      setError(null);

      const response = await api.post(`/chatbot/${companyId}/train`);
      
      if (response.data?.success) {
        // IA treinada com sucesso
        console.log('IA treinada com sucesso');
      } else {
        setError(response.data?.message || 'Erro ao treinar IA');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao treinar IA');
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
        setError(response.data?.message || 'Erro ao carregar histórico');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico');
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
        setError(response.data?.message || 'Erro ao carregar estatísticas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar histórico e estatísticas ao montar o componente
  useEffect(() => {
    if (companyId) {
      getChatHistory();
      getChatStats();
    }
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