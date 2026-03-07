import { PrismaClient } from '@prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';

enum MessageFrom {
  CLIENT = 'CLIENT',
  BOT = 'BOT'
}

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService();

export interface CreateMessageData {
  from: MessageFrom;
  content: string;
}

export interface MessageFilters {
  from?: MessageFrom;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class MessageService {
  async createMessage(companyId: string, data: CreateMessageData) {
    const message = await prisma.message.create({
      data: { ...data, companyId }
    });

    analyticsService.calculateAndStoreDailyAnalytics(companyId, new Date())
      .catch(err => console.error('Erro ao atualizar analytics:', err));

    return message;
  }

  async getMessages(companyId: string, filters: MessageFilters = {}) {
    const where: Record<string, unknown> = { companyId };

    if (filters.from) where['from'] = filters.from;

    if (filters.startDate || filters.endDate) {
      const createdAt: Record<string, Date> = {};
      if (filters.startDate) createdAt['gte'] = filters.startDate;
      if (filters.endDate) createdAt['lte'] = filters.endDate;
      where['createdAt'] = createdAt;
    }

    return prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0
    });
  }

  async getMessageById(messageId: string, companyId: string) {
    const message = await prisma.message.findFirst({
      where: { id: messageId, companyId }
    });
    if (!message) {
      throw new Error('Mensagem não encontrada nesta empresa');
    }
    return message;
  }

  async deleteMessage(messageId: string, companyId: string) {
    const message = await prisma.message.findFirst({
      where: { id: messageId, companyId }
    });
    if (!message) {
      throw new Error('Mensagem não encontrada nesta empresa');
    }

    await prisma.message.delete({ where: { id: messageId } });
    return { message: 'Mensagem deletada com sucesso' };
  }

  async getMessageStats(companyId: string) {
    const totalMessages = await prisma.message.count({ where: { companyId } });

    const messagesByType = await prisma.message.groupBy({
      by: ['from'],
      where: { companyId },
      _count: { id: true }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayMessages = await prisma.message.count({
      where: { companyId, createdAt: { gte: today, lt: tomorrow } }
    });

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekMessages = await prisma.message.count({
      where: { companyId, createdAt: { gte: weekStart } }
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthMessages = await prisma.message.count({
      where: { companyId, createdAt: { gte: monthStart } }
    });

    const hourlyStats = await prisma.message.groupBy({
      by: ['createdAt'],
      where: { companyId },
      _count: { id: true }
    });

    const hourCounts: Record<number, number> = {};
    hourlyStats.forEach(stat => {
      const hour = stat.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + stat._count.id;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }));

    return {
      total: totalMessages,
      today: todayMessages,
      thisWeek: weekMessages,
      thisMonth: monthMessages,
      byType: messagesByType.reduce((acc, stat) => {
        acc[stat.from.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>),
      peakHours
    };
  }

  async getRecentMessages(companyId: string, limit: number = 10) {
    const messages = await prisma.message.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    return messages.reverse();
  }
}
