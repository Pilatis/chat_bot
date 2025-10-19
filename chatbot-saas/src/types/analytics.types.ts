// Tipos para analytics
export interface AnalyticsOverview {
  totalMessages: number;
  todayMessages: number;
  thisWeekMessages: number;
  thisMonthMessages: number;
  messagesByType: {
    client: number;
    bot: number;
  };
  peakHours: Array<{ hour: number; count: number }>;
  mostMentionedProduct?: string;
  averageResponseTime?: number;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
}

export interface HourlyDistribution {
  hour: number;
  client: number;
  bot: number;
  total: number;
}

export interface TopKeyword {
  keyword: string;
  count: number;
}

export interface DashboardData {
  overview: AnalyticsOverview;
  hourlyDistribution: HourlyDistribution[];
  topKeywords: TopKeyword[];
}

export interface MessagesByTimeRange {
  messages: Array<{
    id: string;
    from: 'CLIENT' | 'BOT';
    content: string;
    companyId: string;
    createdAt: string;
  }>;
  dailyStats: Array<{
    date: string;
    client: number;
    bot: number;
    total: number;
  }>;
}

export interface AnalyticsState {
  overview: AnalyticsOverview | null;
  hourlyDistribution: HourlyDistribution[];
  topKeywords: TopKeyword[];
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

export interface AnalyticsContextType extends AnalyticsState {
  getOverview: () => Promise<void>;
  getHourlyDistribution: () => Promise<void>;
  getTopKeywords: (limit?: number) => Promise<void>;
  getDashboardData: () => Promise<void>;
  getMessagesByTimeRange: (startDate: string, endDate: string) => Promise<MessagesByTimeRange>;
  clearError: () => void;
}
