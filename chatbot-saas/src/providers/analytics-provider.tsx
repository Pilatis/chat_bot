'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsContext } from '../context/analytics-context';
import { AnalyticsContextType, AnalyticsOverview, HourlyDistribution, TopKeyword, DashboardData, MessagesByTimeRange } from '../types/analytics.types';
import { useApi } from '../hooks/use-api';

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

  const clearError = (): void => setError(null);

  const getOverview = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/overview`);
      
      if (response.data?.success && response.data?.data) {
        setOverview(response.data.data);
      } else {
        setError(response.data?.message || 'Erro ao carregar visão geral');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar visão geral');
    } finally {
      setIsLoading(false);
    }
  };

  const getHourlyDistribution = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/hourly-distribution`);
      
      if (response.data?.success && response.data?.data) {
        setHourlyDistribution(response.data.data);
      } else {
        setError(response.data?.message || 'Erro ao carregar distribuição horária');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar distribuição horária');
    } finally {
      setIsLoading(false);
    }
  };

  const getTopKeywords = async (limit: number = 10): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/top-keywords?limit=${limit}`);
      
      if (response.data?.success && response.data?.data) {
        setTopKeywords(response.data.data);
      } else {
        setError(response.data?.message || 'Erro ao carregar palavras-chave');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar palavras-chave');
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/analytics/${companyId}/dashboard`);
      
      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setDashboardData(data);
        setOverview(data.overview);
        setHourlyDistribution(data.hourlyDistribution);
        setTopKeywords(data.topKeywords);
      } else {
        setError(response.data?.message || 'Erro ao carregar dados do dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
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
        throw new Error(response.data?.message || 'Erro ao carregar mensagens por período');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar mensagens por período');
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