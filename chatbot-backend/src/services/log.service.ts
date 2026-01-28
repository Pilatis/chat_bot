import { PrismaClient } from '@prisma/client';
import { EmbeddingService } from './embedding.service';

const prisma = new PrismaClient();

/**
 * Serviço de Log (Log Layer)
 * 
 * Responsável por:
 * - Registrar todas as mensagens e interações
 * - Armazenar métricas de performance e custos
 * - Gerar embeddings para análise semântica
 */
export class LogService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Registra uma mensagem no log
   * 
   * @param data - Dados da mensagem
   */
  async logMessage(data: {
    companyId: string;
    conversationId?: string;
    from: 'CLIENT' | 'BOT';
    content: string;
    contentType?: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT';
    source: 'WHATSAPP' | 'WEB_CHAT' | 'API' | 'TEST' | 'SYSTEM';
    metadata?: {
      processingTime?: number;
      aiModel?: string;
      aiTokens?: number;
      aiCost?: number;
      userAgent?: string;
      ip?: string;
      channel?: string;
      device?: string;
      [key: string]: any;
    };
  }) {
    const messageLog = await prisma.messageLog.create({
      data: {
        companyId: data.companyId,
        conversationId: data.conversationId || null,
        from: data.from,
        content: data.content,
        contentType: data.contentType || 'TEXT',
        source: data.source,
        processingTime: data.metadata?.processingTime ?? null,
        aiModel: data.metadata?.aiModel ?? null,
        aiTokens: data.metadata?.aiTokens ?? null,
        aiCost: data.metadata?.aiCost ?? null,
        metadata: data.metadata ? (data.metadata as any) : null
      }
    });

    // Gera e salva embedding para mensagens do cliente (assíncrono)
    if (data.from === 'CLIENT') {
      this.generateAndSaveEmbedding(messageLog.id, data.content, data.companyId)
        .catch(err => console.error('Erro ao gerar embedding:', err));
    }

    return messageLog;
  }

  /**
   * Gera e salva embedding de uma mensagem
   */
  private async generateAndSaveEmbedding(
    messageLogId: string,
    content: string,
    companyId: string
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);

      // Salva embedding no campo metadata do MessageLog
      // Nota: Se você quiser uma tabela separada MessageEmbedding, pode criar
      await prisma.messageLog.update({
        where: { id: messageLogId },
        data: {
          metadata: {
            embedding: embedding,
            embeddingModel: 'text-embedding-3-small',
            embeddingGeneratedAt: new Date().toISOString()
          } as any
        }
      });
    } catch (error) {
      console.error('Erro ao gerar embedding para mensagem:', error);
      // Não falha o log se o embedding falhar
    }
  }

  /**
   * Busca mensagens por similaridade semântica
   * 
   * @param companyId - ID da empresa
   * @param query - Texto para buscar
   * @param options - Opções de busca
   */
  async searchMessagesBySimilarity(
    companyId: string,
    query: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      from?: 'CLIENT' | 'BOT';
      dateRange?: { start: Date; end: Date };
    } = {}
  ) {
    const limit = options.limit ?? 10;
    const minSimilarity = options.minSimilarity ?? 0.7;

    // Gera embedding da query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Busca mensagens com embeddings similares
    // Nota: Esta busca é mais lenta pois precisa calcular similaridade
    // Em produção, considere usar pgvector diretamente na tabela MessageLog
    const whereClause: any = {
      companyId,
      ...(options.from && { from: options.from }),
      ...(options.dateRange && {
        createdAt: {
          gte: options.dateRange.start,
          lte: options.dateRange.end
        }
      }),
      metadata: {
        path: ['embedding'],
        not: null
      }
    };

    const messages = await prisma.messageLog.findMany({
      where: whereClause,
      take: limit * 2 // Busca mais para filtrar por similaridade
    });

    // Calcula similaridade e filtra
    const messagesWithSimilarity = messages
      .map(msg => {
        const embedding = (msg.metadata as any)?.embedding;
        if (!embedding || !Array.isArray(embedding)) return null;

        const similarity = this.embeddingService.calculateSimilarity(
          queryEmbedding,
          embedding
        );

        return {
          ...msg,
          similarity
        };
      })
      .filter((msg): msg is NonNullable<typeof msg> => 
        msg !== null && msg.similarity >= minSimilarity
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return messagesWithSimilarity;
  }

  /**
   * Obtém estatísticas de logs
   */
  async getLogStats(
    companyId: string,
    options: {
      dateRange?: { start: Date; end: Date };
      groupBy?: 'day' | 'hour' | 'source';
    } = {}
  ) {
    const where: any = {
      companyId,
      ...(options.dateRange && {
        createdAt: {
          gte: options.dateRange.start,
          lte: options.dateRange.end
        }
      })
    };

    const total = await prisma.messageLog.count({ where });

    const byFrom = await prisma.messageLog.groupBy({
      by: ['from'],
      where,
      _count: { id: true }
    });

    const bySource = await prisma.messageLog.groupBy({
      by: ['source'],
      where,
      _count: { id: true }
    });

    // Estatísticas de IA
    const aiStats = await prisma.messageLog.aggregate({
      where: {
        ...where,
        aiTokens: { not: null }
      },
      _sum: {
        aiTokens: true,
        aiCost: true
      },
      _avg: {
        processingTime: true
      }
    });

    return {
      total,
      byFrom: byFrom.reduce((acc, item) => {
        acc[item.from] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      bySource: bySource.reduce((acc, item) => {
        acc[item.source] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      aiStats: {
        totalTokens: aiStats._sum.aiTokens || 0,
        totalCost: aiStats._sum.aiCost || 0,
        avgProcessingTime: aiStats._avg.processingTime || 0
      }
    };
  }

  /**
   * Lista mensagens de uma conversa
   */
  async getConversationMessages(
    conversationId: string,
    options: {
      limit?: number;
      orderBy?: 'asc' | 'desc';
    } = {}
  ) {
    return await prisma.messageLog.findMany({
      where: { conversationId },
      orderBy: {
        createdAt: options.orderBy || 'asc'
      },
      ...(options.limit && { take: options.limit })
    });
  }

  /**
   * Deleta logs antigos (para limpeza)
   */
  async deleteOldLogs(
    companyId: string,
    olderThanDays: number = 90
  ) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return await prisma.messageLog.deleteMany({
      where: {
        companyId,
        createdAt: { lt: cutoffDate }
      }
    });
  }
}

