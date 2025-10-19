import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DailyStats = Record<string, { client: number; bot: number; total: number }>;

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

export interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export class AnalyticsService {
  async getOverview(companyId: string, userId: string): Promise<AnalyticsOverview> {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Total de mensagens
    const totalMessages = await prisma.message.count({
      where: { companyId }
    });

    // Mensagens de hoje
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

    // Mensagens por tipo
    const messagesByType = await prisma.message.groupBy({
      by: ['from'],
      where: { companyId },
      _count: {
        id: true
      }
    });

    const messagesByTypeFormatted = messagesByType.reduce((acc, stat: { from: string; _count: { id: number } }) => {
      acc[stat.from.toLowerCase()] = stat._count.id;
      return acc;
    }, { client: 0, bot: 0 } as Record<string, number>);

    // Horários de pico
    const hourlyStats = await prisma.message.groupBy({
      by: ['createdAt'],
      where: { companyId },
      _count: {
        id: true
      }
    });

    const hourCounts: Record<number, number> = {};
    hourlyStats.forEach((stat: { createdAt: Date; _count: { id: number } }) => {
      const hour = stat.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + stat._count.id;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    // Produto mais mencionado (simulação)
    const mostMentionedProduct = await this.getMostMentionedProduct(companyId);

    // Tempo médio de resposta (simulação)
    const averageResponseTime = await this.calculateAverageResponseTime(companyId);

    // Engajamento do usuário (simulação)
    const userEngagement = await this.getUserEngagement(companyId);

    return {
      totalMessages,
      todayMessages,
      thisWeekMessages,
      thisMonthMessages,
      messagesByType: {
        client: messagesByTypeFormatted?.['client'] || 0,
        bot: messagesByTypeFormatted?.['bot'] || 0
      },
      peakHours,
      mostMentionedProduct: mostMentionedProduct || '',
      averageResponseTime,
      userEngagement
    };
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
      if (!date) return acc; // ignora mensagens sem data
    
      const from = message.from?.toLowerCase();
      if (!from || !['client', 'bot'].includes(from)) return acc; // ignora valores inesperados
    
      if (!acc[date]) {
        acc[date] = { client: 0, bot: 0, total: 0 };
      }
    
      acc[date][from]++;
      acc[date].total++;
    
      return acc;
    }, {} as DailyStats);
  }

  async getHourlyDistribution(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const messages = await prisma.message.findMany({
      where: { companyId },
      select: { createdAt: true, from: true }
    });

    // Agrupar por hora
    const hourlyDistribution: Record<number, { client: number; bot: number; total: number }> = {};
    
    for (let hour = 0; hour < 24; hour++) {
      hourlyDistribution[hour] = { client: 0, bot: 0, total: 0 };
    }

    messages.forEach((message: { createdAt: Date; from: string }) => {
      const hour = message.createdAt.getHours();
      if (hourlyDistribution[hour]) {
        hourlyDistribution[hour][message.from.toLowerCase()]++;
        hourlyDistribution[hour].total++;
      }
    });

    return Object.entries(hourlyDistribution).map(([hour, stats]) => ({
      hour: parseInt(hour),
      ...stats
    }));
  }

  async getTopKeywords(companyId: string, userId: string, limit: number = 10) {
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
        from: 'CLIENT'
      },
      select: { content: true }
    });

    // Simulação de análise de palavras-chave
    const keywordCounts: Record<string, number> = {};
    const commonWords = ['o', 'a', 'de', 'da', 'do', 'em', 'para', 'com', 'que', 'não', 'sim', 'obrigado', 'obrigada'];

    messages.forEach((message: { content: string }) => {
      const words = message.content.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((word: string) => word.length > 2 && !commonWords.includes(word));

      words.forEach((word: string) => {
        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([keyword, count]) => ({ keyword, count }));

    return topKeywords;
  }

  private async getMostMentionedProduct(companyId: string): Promise<string | undefined> {
    // Simulação - em um cenário real, seria feita análise de NLP
    const products = await prisma.product.findMany({
      where: { companyId },
      select: { name: true }
    });

    if (products.length === 0) return undefined;

    // Simular produto mais mencionado baseado em dados aleatórios
    const randomIndex = Math.floor(Math.random() * products.length);
    return products[randomIndex]?.name ?? '';
  }

  private async calculateAverageResponseTime(companyId: string): Promise<number> {
    // Simulação - em um cenário real, seria calculado o tempo entre mensagens do cliente e bot
    return Math.floor(Math.random() * 300) + 30; // 30-330 segundos
  }

  private async getUserEngagement(companyId: string) {
    // Simulação de métricas de engajamento
    return {
      totalUsers: Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(Math.random() * 100) + 10,
      newUsers: Math.floor(Math.random() * 50) + 5
    };
  }
}
