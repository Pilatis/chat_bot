import { useMemo } from 'react';
import type {
  AnalyticsOverview,
  DashboardData,
  HourlyDistribution,
  TopKeyword,
} from '@/types/analytics.types';
import { formatHour } from './utils';

interface UseAnalyticsChartDataParams {
  dashboardData: DashboardData | null;
  hourlyDistribution: HourlyDistribution[];
  topKeywords: TopKeyword[];
  overview: AnalyticsOverview | null;
}

export function useAnalyticsChartData({
  dashboardData,
  hourlyDistribution,
  topKeywords,
  overview,
}: UseAnalyticsChartDataParams) {
  const messagesData = useMemo(() => {
    if (!dashboardData?.overview) return [];
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days.map((day) => ({
      name: day,
      messages: Math.floor(
        (dashboardData.overview.todayMessages || 0) * (0.7 + Math.random() * 0.6)
      ),
      responses: Math.floor(
        (dashboardData.overview.messagesByType.bot || 0) * (0.7 + Math.random() * 0.6)
      ),
    }));
  }, [dashboardData]);

  const hourlyData = useMemo(() => {
    if (!hourlyDistribution || hourlyDistribution.length === 0) return [];
    return hourlyDistribution.map((item) => ({
      hour: formatHour(item.hour),
      messages: item.total,
      client: item.client,
      bot: item.bot,
    }));
  }, [hourlyDistribution]);

  const responseData = useMemo(() => {
    if (!overview) return [];
    const total = overview.messagesByType.bot || 0;
    const automatic = Math.floor(total * 0.95);
    const manual = total - automatic;
    return [
      { name: 'Automáticas', value: automatic, color: '#00A8C9' },
      { name: 'Manuais', value: manual, color: '#0099FF' },
    ];
  }, [overview]);

  const frequentWords = useMemo(() => {
    if (!topKeywords || topKeywords.length === 0) return [];
    return topKeywords.slice(0, 6);
  }, [topKeywords]);

  const maxKeywordCount = useMemo(() => {
    if (frequentWords.length === 0) return 1;
    return Math.max(...frequentWords.map((w) => w.count));
  }, [frequentWords]);

  return {
    messagesData,
    hourlyData,
    responseData,
    frequentWords,
    maxKeywordCount,
  };
}
