import { useContext } from 'react';
import { AnalyticsContext } from '../context/analytics-context';
import { AnalyticsContextType } from '../types/analytics.types';

// Hook para usar analytics
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics deve ser usado dentro de um AnalyticsProvider');
  }
  return context;
};

// Hook para métricas específicas
export const useMetrics = (companyId: string) => {
  const { overview, isLoading, error, getOverview } = useAnalytics();

  const metrics = {
    totalMessages: overview?.totalMessages || 0,
    todayMessages: overview?.todayMessages || 0,
    thisWeekMessages: overview?.thisWeekMessages || 0,
    thisMonthMessages: overview?.thisMonthMessages || 0,
    clientMessages: overview?.messagesByType.client || 0,
    botMessages: overview?.messagesByType.bot || 0,
    averageResponseTime: overview?.averageResponseTime || 0,
    peakHours: overview?.peakHours || []
  };

  return {
    metrics,
    isLoading,
    error,
    refresh: getOverview
  };
};