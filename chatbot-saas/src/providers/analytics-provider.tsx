'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsContext } from '../context/analytics-context';
import { AnalyticsContextType, AnalyticsOverview, HourlyDistribution, TopKeyword, DashboardData, MessagesByTimeRange } from '../types/analytics.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

interface AnalyticsProviderProps {
  children: React.ReactNode;
  companyId: string;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children, companyId }) => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyDistribution[]>([]);
  const [topKeywords, setTopKeywords] = useState<TopKeyword[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { api } = useApi();
  const { showError } = useToast();

  const clearError = (): void => setError(null);

  const getOverview = async (period: string = '7'): Promise<void> => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/overview?period=${period}`);
      
      if (response.data?.success && response.data?.data) {
        setOverview(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar visão geral';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar visão geral';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getHourlyDistribution = async (period: string = '7'): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/hourly-distribution?period=${period}`);
      
      if (response.data?.success && response.data?.data) {
        setHourlyDistribution(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar distribuição horária';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar distribuição horária';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getTopKeywords = async (limit: number = 10, period: string = '7'): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/top-keywords?limit=${limit}&period=${period}`);
      
      if (response.data?.success && response.data?.data) {
        setTopKeywords(response.data.data);
      } else {
        const msg = response.data?.message || 'Erro ao carregar palavras-chave';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar palavras-chave';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardData = async (period: string = '7'): Promise<void> => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/dashboard?period=${period}`);
      
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setDashboardData(data);
        setOverview(data.overview);
        setHourlyDistribution(data.hourlyDistribution);
        setTopKeywords(data.topKeywords);
      } else {
        const msg = response.data?.message || 'Erro ao carregar dados do dashboard';
        showError(msg);
        setError(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar dados do dashboard';
      showError(msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessagesByTimeRange = async (startDate: string, endDate: string): Promise<MessagesByTimeRange> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/messages-by-range?startDate=${startDate}&endDate=${endDate}`);
      
      if (response.data?.success && response.data?.data) {
        setIsLoading(false);
        return response.data.data;
      } else {
        const msg = response.data?.message || 'Erro ao carregar mensagens por período';
        showError(msg);
        setError(msg);
        setIsLoading(false);
        throw new Error(msg);
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao carregar mensagens por período';
      showError(msg);
      setError(msg);
      setIsLoading(false);
      throw err;
    }
  };

  // Carregar dados do dashboard ao montar o componente
  useEffect(() => {
    if (companyId) {
      getDashboardData();
    }
  }, [companyId]);

  const contextValue: AnalyticsContextType = {
    overview,
    hourlyDistribution,
    topKeywords,
    dashboardData,
    isLoading,
    error,
    getOverview,
    getHourlyDistribution,
    getTopKeywords,
    getDashboardData,
    getMessagesByTimeRange,
    clearError
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};