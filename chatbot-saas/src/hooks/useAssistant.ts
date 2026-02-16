import { useContext } from 'react';
import { AssistantContext } from '../context/assistant-context';
import { AssistantContextType } from '../types/assistant.types';

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant deve ser usado dentro de um AssistantProvider');
  }
  return context;
};
