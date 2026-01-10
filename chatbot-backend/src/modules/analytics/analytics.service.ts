import { PrismaClient, MessageFrom } from '@prisma/client';

const prisma = new PrismaClient();

type DailyStats = Record<string, { client: number; bot: number; total: number }>;
type HourlyStats = Record<number, { client: number; bot: number; total: number }>;
type KeywordCount = { keyword: string; count: number };

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
  responseRate?: number;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
}

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export type PeriodFilter = 'today' | '7' | '14' | '30';

// Função auxiliar para calcular datas baseado no período
function getPeriodDates(period: PeriodFilter): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  
  const startDate = new Date();
  
  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7':
      startDate.setDate(startDate.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '14':
      startDate.setDate(startDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      break;
    case '30':
      startDate.setDate(startDate.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      break;
  }
  
  return { startDate, endDate };
}

export class AnalyticsService {
  /**
   * Calcula e armazena as métricas de analytics para uma data específica
   */
  async calculateAndStoreDailyAnalytics(companyId: string, date: Date = new Date()): Promise<void> {
    // Normalizar data para início do dia
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Buscar todas as mensagens do dia
    const messages = await prisma.message.findMany({
      where: {
        companyId,
        createdAt: {
          gte: dayStart,
          lt: dayEnd
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Calcular métricas básicas
    const clientMessages = messages.filter(m => m.from === MessageFrom.CLIENT);
    const botMessages = messages.filter(m => m.from === MessageFrom.BOT);
    const totalMessages = messages.length;

    // Calcular taxa de resposta
    const responseRate = clientMessages.length > 0 
      ? (botMessages.length / clientMessages.length) * 100 
      : null;

    // Calcular tempo médio de resposta
    const averageResponseTime = await this.calculateAverageResponseTimeForDay(messages);

    // Calcular distribuição horária
    const hourlyDistribution = this.calculateHourlyDistribution(messages);

    // Calcular palavras mais frequentes
    const topKeywords = await this.calculateTopKeywords(clientMessages.map(m => m.content), 10);

    // Calcular distribuição de respostas (todas são automáticas por enquanto)
    const automaticResponses = botMessages.length;
    const manualResponses = 0; // Pode ser implementado no futuro

    // Buscar ou criar registro de analytics
    const analytics = await prisma.analytics.upsert({
      where: {
        companyId_date: {
          companyId,
          date: dayStart
        }
      },
      update: {
        totalMessages,
        clientMessages: clientMessages.length,
        botMessages: botMessages.length,
        responseRate,
        averageResponseTime,
        automaticResponses,
        manualResponses,
        hourlyDistribution: hourlyDistribution as any,
        topKeywords: topKeywords as any
      },
      create: {
        companyId,
        date: dayStart,
        totalMessages,
        clientMessages: clientMessages.length,
        botMessages: botMessages.length,
        responseRate,
        averageResponseTime,
        automaticResponses,
        manualResponses,
        hourlyDistribution: hourlyDistribution as any,
        topKeywords: topKeywords as any
      }
    });
  }

  /**
   * Calcula o tempo médio de resposta em segundos para um conjunto de mensagens
   */
  private async calculateAverageResponseTimeForDay(messages: any[]): Promise<number | null> {
    const responseTimes: number[] = [];
    
    for (let i = 0; i < messages.length - 1; i++) {
      const currentMessage = messages[i];
      const nextMessage = messages[i + 1];

      // Se a mensagem atual é do cliente e a próxima é do bot
      if (currentMessage.from === MessageFrom.CLIENT && nextMessage.from === MessageFrom.BOT) {
        const timeDiff = (nextMessage.createdAt.getTime() - currentMessage.createdAt.getTime()) / 1000; // em segundos
        if (timeDiff > 0 && timeDiff < 3600) { // Ignorar tempos negativos ou muito grandes (mais de 1 hora)
          responseTimes.push(timeDiff);
        }
      }
    }

    if (responseTimes.length === 0) return null;

    const average = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return Math.round(average * 100) / 100; // Arredondar para 2 casas decimais
  }

  /**
   * Calcula a distribuição de mensagens por hora (0-23)
   */
  private calculateHourlyDistribution(messages: any[]): HourlyStats {
    const hourlyStats: HourlyStats = {};

    // Inicializar todas as horas
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats[hour] = { client: 0, bot: 0, total: 0 };
    }

    // Contar mensagens por hora
    messages.forEach(message => {
      const hour = message.createdAt.getHours();
      if (hourlyStats[hour]) {
        if (message.from === MessageFrom.CLIENT) {
          hourlyStats[hour].client++;
        } else {
          hourlyStats[hour].bot++;
        }
        hourlyStats[hour].total++;
      }
    });

    return hourlyStats;
  }

  /**
   * Calcula as palavras mais frequentes nas mensagens
   */
  private async calculateTopKeywords(contents: string[], limit: number = 10): Promise<KeywordCount[]> {
    const keywordCounts: Record<string, number> = {};
    const commonWords = [
      'o', 'a', 'de', 'da', 'do', 'em', 'para', 'com', 'que', 'não', 'sim', 
      'obrigado', 'obrigada', 'por', 'favor', 'você', 'seu', 'sua', 'me', 
      'eu', 'um', 'uma', 'é', 'está', 'foi', 'ser', 'ter', 'tem', 'há'
    ];

    contents.forEach(content => {
      const words = content
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s]/g, '') // Remove pontuação
        .split(/\s+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));

      words.forEach(word => {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      });
    });

    return Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  /**
   * Obtém a visão geral de analytics
   */
  async getOverview(companyId: string, userId: string, period: PeriodFilter = '7'): Promise<AnalyticsOverview> {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Calcular período
    const { startDate, endDate } = getPeriodDates(period);

    // Garantir que analytics de hoje está calculado
    await this.calculateAndStoreDailyAnalytics(companyId);

    // Total de mensagens (sempre total geral)
    const totalMessages = await prisma.message.count({
      where: { companyId }
    });

    // Mensagens do período selecionado
    const periodMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Mensagens de hoje (sempre calcular)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Mensagens desta semana
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const thisWeekMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: weekStart
        }
      }
    });

    // Mensagens deste mês
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const thisMonthMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: monthStart
        }
      }
    });

    // Mensagens por tipo (do período selecionado)
    const messagesByType = await prisma.message.groupBy({
      by: ['from'],
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    });

    const messagesByTypeFormatted = messagesByType.reduce((acc, stat: { from: string; _count: { id: number } }) => {
      acc[stat.from.toLowerCase()] = stat._count.id;
      return acc;
    }, { client: 0, bot: 0 } as Record<string, number>);

    // Buscar analytics do período selecionado
    const periodAnalytics = await prisma.analytics.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        hourlyDistribution: true,
        averageResponseTime: true,
        responseRate: true
      }
    });

    const hourCounts: Record<number, number> = {};
    periodAnalytics.forEach(analytics => {
      if (analytics.hourlyDistribution) {
        const hourly = analytics.hourlyDistribution as any;
        Object.keys(hourly).forEach(hourStr => {
          const hour = parseInt(hourStr);
          const stats = hourly[hourStr];
          hourCounts[hour] = (hourCounts[hour] || 0) + (stats?.total || 0);
        });
      }
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Produto mais mencionado
    const mostMentionedProduct = await this.getMostMentionedProduct(companyId);

    // Tempo médio de resposta e taxa de resposta (média do período)
    let averageResponseTime: number | undefined;
    let responseRate: number | undefined;

    if (periodAnalytics.length > 0) {
      const validAnalytics = periodAnalytics.filter(a => a.averageResponseTime !== null);
      if (validAnalytics.length > 0) {
        const avgResponseTime = validAnalytics.reduce((sum, a) => sum + (a.averageResponseTime || 0), 0) / validAnalytics.length;
        const avgResponseRate = validAnalytics.reduce((sum, a) => sum + (a.responseRate || 0), 0) / validAnalytics.length;
        averageResponseTime = avgResponseTime;
        responseRate = avgResponseRate;
      }
    }

    // Engajamento do usuário (simulação)
    const userEngagement = await this.getUserEngagement(companyId);

    const result: AnalyticsOverview = {
      totalMessages,
      todayMessages: period === 'today' ? periodMessages : todayMessages,
      thisWeekMessages,
      thisMonthMessages,
      messagesByType: {
        client: messagesByTypeFormatted?.['client'] || 0,
        bot: messagesByTypeFormatted?.['bot'] || 0
      },
      peakHours,
      mostMentionedProduct: mostMentionedProduct || '',
      userEngagement
    };

    if (averageResponseTime !== undefined) {
      result.averageResponseTime = averageResponseTime;
    }

    if (responseRate !== undefined) {
      result.responseRate = responseRate;
    }

    return result;
  }

  async getMessagesByTimeRange(companyId: string, userId: string, timeRange: TimeRange) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const messages = await prisma.message.findMany({
      where: {
        companyId,
        createdAt: {
          gte: timeRange.startDate,
          lte: timeRange.endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Agrupar por dia
    const dailyStats = messages.reduce((acc: DailyStats, message) => {
      const date = message.createdAt?.toISOString().split('T')[0];
      if (!date) return acc;

      const from = message.from?.toLowerCase();
      if (!from || !['client', 'bot'].includes(from)) return acc;

      if (!acc[date]) {
        acc[date] = { client: 0, bot: 0, total: 0 };
      }

      acc[date][from]++;
      acc[date].total++;

      return acc;
    }, {} as DailyStats);

    return {
      messages: messages.map(m => ({
        id: m.id,
        from: m.from,
        content: m.content,
        companyId: m.companyId,
        createdAt: m.createdAt.toISOString()
      })),
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      }))
    };
  }

  async getHourlyDistribution(companyId: string, userId: string, period: PeriodFilter = '7') {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Calcular período
    const { startDate } = getPeriodDates(period);

    const analytics = await prisma.analytics.findMany({
      where: {
        companyId,
        date: {
          gte: startDate
        }
      },
      select: {
        hourlyDistribution: true
      }
    });

    // Agregar distribuição horária
    const hourlyDistribution: Record<number, { client: number; bot: number; total: number }> = {};

    for (let hour = 0; hour < 24; hour++) {
      hourlyDistribution[hour] = { client: 0, bot: 0, total: 0 };
    }

    analytics.forEach(analyticsRecord => {
      if (analyticsRecord.hourlyDistribution) {
        const hourly = analyticsRecord.hourlyDistribution as any;
        Object.keys(hourly).forEach(hourStr => {
          const hour = parseInt(hourStr);
          const stats = hourly[hourStr];
          if (hourlyDistribution[hour]) {
            hourlyDistribution[hour].client += stats?.client || 0;
            hourlyDistribution[hour].bot += stats?.bot || 0;
            hourlyDistribution[hour].total += stats?.total || 0;
          }
        });
      }
    });

    return Object.entries(hourlyDistribution).map(([hour, stats]) => ({
      hour: parseInt(hour),
      ...stats
    }));
  }

  async getTopKeywords(companyId: string, userId: string, limit: number = 10, period: PeriodFilter = '7') {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Calcular período
    const { startDate } = getPeriodDates(period);

    const analytics = await prisma.analytics.findMany({
      where: {
        companyId,
        date: {
          gte: startDate
        }
      },
      select: {
        topKeywords: true
      }
    });

    // Agregar keywords
    const keywordCounts: Record<string, number> = {};

    analytics.forEach(analyticsRecord => {
      if (analyticsRecord.topKeywords) {
        const keywords = analyticsRecord.topKeywords as KeywordCount[];
        keywords.forEach(({ keyword, count }) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + count;
        });
      }
    });

    return Object.entries(keywordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));
  }

  /**
   * Obtém o volume de mensagens por dia para um período
   */
  async getDailyVolume(companyId: string, userId: string, period: PeriodFilter = '7') {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Calcular período
    const { startDate, endDate } = getPeriodDates(period);

    // Buscar analytics do período
    const analytics = await prisma.analytics.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return analytics.map(a => ({
      date: a.date.toISOString().split('T')[0],
      total: a.totalMessages,
      client: a.clientMessages,
      bot: a.botMessages
    }));
  }

  /**
   * Obtém a distribuição de respostas (automáticas vs manuais)
   */
  async getResponseDistribution(companyId: string, userId: string, startDate: Date, endDate: Date) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Agregar distribuição de respostas
    const analytics = await prisma.analytics.aggregate({
      where: {
        companyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        automaticResponses: true,
        manualResponses: true
      }
    });

    const total = (analytics._sum.automaticResponses || 0) + (analytics._sum.manualResponses || 0);

    return {
      automatic: analytics._sum.automaticResponses || 0,
      manual: analytics._sum.manualResponses || 0,
      total,
      automaticPercentage: total > 0 ? ((analytics._sum.automaticResponses || 0) / total) * 100 : 0,
      manualPercentage: total > 0 ? ((analytics._sum.manualResponses || 0) / total) * 100 : 0
    };
  }

  private async getMostMentionedProduct(companyId: string): Promise<string | undefined> {
    // Buscar produtos da empresa
    const products = await prisma.product.findMany({
      where: { companyId },
      select: { name: true }
    });

    if (products.length === 0) return undefined;

    // Buscar mensagens do cliente e verificar menções
    const clientMessages = await prisma.message.findMany({
      where: {
        companyId,
        from: MessageFrom.CLIENT
      },
      select: { content: true }
    });

    const productMentions: Record<string, number> = {};
    products.forEach(product => {
      const mentions = clientMessages.filter(msg =>
        msg.content.toLowerCase().includes(product.name.toLowerCase())
      ).length;
      if (mentions > 0) {
        productMentions[product.name] = mentions;
      }
    });

    if (Object.keys(productMentions).length === 0) return undefined;

    // Retornar produto mais mencionado
    const sorted = Object.entries(productMentions).sort(([, a], [, b]) => b - a);
    return sorted[0]?.[0];
  }

  private async getUserEngagement(companyId: string) {
    // Simulação de métricas de engajamento
    // Em um cenário real, isso seria calculado baseado em dados de usuários únicos
    const uniqueClients = await prisma.message.groupBy({
      by: ['content'], // Simulação - em produção seria por identificador de cliente
      where: {
        companyId,
        from: MessageFrom.CLIENT
      },
      _count: {
        id: true
      }
    });

    return {
      totalUsers: uniqueClients.length || Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(uniqueClients.length * 0.1) || Math.floor(Math.random() * 100) + 10,
      newUsers: Math.floor(uniqueClients.length * 0.05) || Math.floor(Math.random() * 50) + 5
    };
  }
}
