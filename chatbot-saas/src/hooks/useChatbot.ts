import { useContext } from 'react';
import { ChatbotContext } from '../context/chatbot-context';
import { ChatbotContextType } from '../types/chatbot.types';

// Hook para usar chatbot
export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot deve ser usado dentro de um ChatbotProvider');
  }
  return context;
};

// Hook para chat em tempo real
export const useChat = (companyId: string) => {
  const {
    messages,
    isProcessing,
    error,
    sendMessage,
    clearMessages,
    clearError
  } = useChatbot();

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  const handleClearChat = () => {
    clearMessages();
  };

  return {
    messages,
    isProcessing,
    error,
    sendMessage: handleSendMessage,
    clearChat: handleClearChat,
    clearError
  };
};