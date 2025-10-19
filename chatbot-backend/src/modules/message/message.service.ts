import { PrismaClient } from '@prisma/client';

// Definir enum localmente
enum MessageFrom {
  CLIENT = 'CLIENT',
  BOT = 'BOT'
}

const prisma = new PrismaClient();

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
  async createMessage(companyId: string, userId: string, data: CreateMessageData) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const message = await prisma.message.create({
      data: {
        ...data,
        companyId
      }
    });

    return message;
  }

  async getMessages(companyId: string, userId: string, filters: MessageFilters = {}) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const where: any = { companyId };

    if (filters.from) {
      where.from = filters.from;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0
    });

    return messages;
  }

  async getMessageById(messageId: string, userId: string) {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!message) {
      throw new Error('Mensagem não encontrada ou não pertence ao usuário');
    }

    return message;
  }

  async deleteMessage(messageId: string, userId: string) {
    // Verificar se a mensagem pertence a uma empresa do usuário
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        company: {
          ownerId: userId
        }
      }
    });

    if (!message) {
      throw new Error('Mensagem não encontrada ou não pertence ao usuário');
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return { message: 'Mensagem deletada com sucesso' };
  }

  async getMessageStats(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Estatísticas gerais
    const totalMessages = await prisma.message.count({
      where: { companyId }
    });

    const messagesByType = await prisma.message.groupBy({
      by: ['from'],
      where: { companyId },
      _count: {
        id: true
      }
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

    const weekMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: weekStart
        }
      }
    });

    // Mensagens deste mês
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: monthStart
        }
      }
    });

    // Horários de pico (simulação)
    const hourlyStats = await prisma.message.groupBy({
      by: ['createdAt'],
      where: { companyId },
      _count: {
        id: true
      }
    });

    // Processar dados para encontrar horários de pico
    const hourCounts: Record<number, number> = {};
    hourlyStats.forEach(stat => {
      const hour = stat.createdAt.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + stat._count.id;
    });

    const peakHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
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

  async getRecentMessages(companyId: string, userId: string, limit: number = 10) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const messages = await prisma.message.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return messages.reverse(); // Retornar em ordem cronológica
  }
}
