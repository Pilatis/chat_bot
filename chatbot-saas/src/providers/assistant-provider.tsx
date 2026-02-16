'use client';

import React, { useState, useEffect } from 'react';
import { AssistantContext } from '../context/assistant-context';
import {
  AssistantContextType,
  Assistant,
  CreateAssistantData,
  UpdateAssistantData,
  AssistantProviderResult
} from '../types/assistant.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';
import { useCompany } from '../hooks/useCompany';

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showError, showSuccess } = useToast();
  const { company } = useCompany();

  const clearError = () => setError(null);

  const refreshAssistants = async (companyId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/company/${companyId}/assistant`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setAssistants(response.data.data);
      } else {
        setAssistants([]);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar assistentes';
      showError(msg);
      setError(msg);
      setAssistants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createAssistant = async (
    companyId: string,
    data: CreateAssistantData
  ): Promise<AssistantProviderResult> => {
    try {
      setError(null);
      const response = await api.post(`/company/${companyId}/assistant`, data);
      if (response.data?.success) {
        await refreshAssistants(companyId);
        showSuccess(response.data?.message || 'Assistente criado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao criar assistente';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao criar assistente';
      showError(msg);
      setError(msg);
      return 'failure';
    }
  };

  const updateAssistant = async (
    assistantId: string,
    data: UpdateAssistantData
  ): Promise<AssistantProviderResult> => {
    try {
      setError(null);
      const response = await api.put(`/assistant/${assistantId}`, data);
      if (response.data?.success) {
        if (company?.id) await refreshAssistants(company.id);
        showSuccess(response.data?.message || 'Assistente atualizado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao atualizar assistente';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao atualizar assistente';
      showError(msg);
      setError(msg);
      return 'failure';
    }
  };

  useEffect(() => {
    if (company?.id) {
      refreshAssistants(company.id);
    } else {
      setAssistants([]);
      setIsLoading(false);
    }
  }, [company?.id]);

  const currentAssistant: Assistant | null = assistants.length > 0 ? assistants[0]! : null;

  const contextValue: AssistantContextType = {
    assistants,
    currentAssistant,
    isLoading,
    error,
    createAssistant,
    updateAssistant,
    refreshAssistants,
    clearError
  };

  return (
    <AssistantContext.Provider value={contextValue}>
      {children}
    </AssistantContext.Provider>
  );
}
