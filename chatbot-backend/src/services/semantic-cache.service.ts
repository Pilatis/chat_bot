import { PrismaClient } from '@prisma/client';
import { searchSimilarCaches, createConversationCacheWithVector } from '../utils/vectorUtils';
import { EmbeddingService } from './embedding.service';

const prisma = new PrismaClient();

/**
 * Serviço de Cache Semântico
 * 
 * Responsável por:
 * - Armazenar respostas para perguntas similares
 * - Buscar cache por similaridade semântica
 * - Gerenciar expiração e limpeza de cache
 */
export class SemanticCacheService {
  private embeddingService: EmbeddingService;
  private readonly defaultMinSimilarity: number = 0.85;
  private readonly defaultCacheExpirationHours: number = 24;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Busca cache semântico para uma query
   * 
   * @param companyId - ID da empresa
   * @param query - Texto da pergunta
   * @param options - Opções de busca
   * @returns Cache encontrado ou null
   */
  async findCachedResponse(
    companyId: string,
    query: string,
    options: {
      minSimilarity?: number;
      cacheType?: 'CACHE' | 'MEMORY' | 'HYBRID';
    } = {}
  ) {
    const minSimilarity = options.minSimilarity ?? this.defaultMinSimilarity;

    // Gera embedding da query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Busca caches similares (só passa cacheType se definido, por causa de exactOptionalPropertyTypes)
    const caches = await searchSimilarCaches(companyId, queryEmbedding, {
      limit: 1,
      minSimilarity,
      ...(options.cacheType !== undefined && { cacheType: options.cacheType }),
      isActive: true
    });

    if (caches.length === 0) {
      return null;
    }

    const cache = caches[0];

    // Atualiza estatísticas do cache (hit count)
    await this.incrementCacheHit(cache.id);

    return {
      response: cache.response,
      confidence: cache.confidence,
      similarity: cache.similarity,
      source: cache.source,
      cacheId: cache.id
    };
  }

  /**
   * Salva uma resposta no cache semântico
   * 
   * @param data - Dados do cache
   */
  async saveCache(data: {
    companyId: string;
    conversationId?: string;
    query: string;
    response: string;
    source: 'RAG' | 'MEMORY' | 'AI' | 'HYBRID';
    confidence?: number;
    cacheType?: 'CACHE' | 'MEMORY' | 'HYBRID';
    expiresAt?: Date;
    metadata?: any;
  }) {
    // Gera embedding da query
    const queryEmbedding = await this.embeddingService.generateEmbedding(data.query);

    // Calcula expiração padrão se não fornecida
    const expiresAt = data.expiresAt || new Date(
      Date.now() + this.defaultCacheExpirationHours * 60 * 60 * 1000
    );

    return await createConversationCacheWithVector({
      companyId: data.companyId,
      ...(data.conversationId !== undefined && { conversationId: data.conversationId }),
      queryEmbedding,
      queryText: data.query,
      response: data.response,
      cacheType: data.cacheType || 'CACHE',
      source: data.source,
      confidence: data.confidence ?? 1.0,
      expiresAt,
      metadata: data.metadata
    });
  }

  /**
   * Incrementa contador de hits do cache
   */
  private async incrementCacheHit(cacheId: string) {
    await prisma.$executeRaw`
      UPDATE conversation_caches
      SET 
        "hitCount" = "hitCount" + 1,
        "lastUsedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${cacheId}::uuid
    `;
  }

  /**
   * Invalida um cache específico
   */
  async invalidateCache(cacheId: string) {
    return await prisma.conversationCache.update({
      where: { id: cacheId },
      data: { isActive: false }
    });
  }

  /**
   * Limpa caches expirados
   */
  async cleanExpiredCaches(companyId?: string) {
    const whereClause = companyId 
      ? `WHERE "companyId" = '${companyId}'::uuid AND "expiresAt" < NOW()`
      : `WHERE "expiresAt" < NOW()`;

    const result = await prisma.$executeRawUnsafe(`
      UPDATE conversation_caches
      SET "isActive" = false
      ${whereClause}
    `);

    return result;
  }

  /**
   * Limpa caches antigos com baixo hit count
   */
  async cleanLowUsageCaches(
    companyId: string,
    options: {
      maxAgeDays?: number;
      minHitCount?: number;
    } = {}
  ) {
    const maxAgeDays = options.maxAgeDays ?? 30;
    const minHitCount = options.minHitCount ?? 1;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);

    return await prisma.conversationCache.updateMany({
      where: {
        companyId,
        isActive: true,
        hitCount: { lt: minHitCount },
        createdAt: { lt: cutoffDate }
      },
      data: { isActive: false }
    });
  }

  /**
   * Obtém estatísticas de cache
   */
  async getCacheStats(companyId: string) {
    const total = await prisma.conversationCache.count({
      where: { companyId }
    });

    const active = await prisma.conversationCache.count({
      where: { companyId, isActive: true }
    });

    const expired = await prisma.conversationCache.count({
      where: {
        companyId,
        isActive: true,
        expiresAt: { lt: new Date() }
      }
    });

    const totalHits = await prisma.conversationCache.aggregate({
      where: { companyId },
      _sum: { hitCount: true }
    });

    const avgHits = total > 0 ? (totalHits._sum.hitCount || 0) / total : 0;

    return {
      total,
      active,
      expired,
      totalHits: totalHits._sum.hitCount || 0,
      avgHits: Math.round(avgHits * 100) / 100
    };
  }

  /**
   * Lista caches de uma empresa
   */
  async listCaches(
    companyId: string,
    options: {
      cacheType?: 'CACHE' | 'MEMORY' | 'HYBRID';
      isActive?: boolean;
      limit?: number;
    } = {}
  ) {
    return await prisma.conversationCache.findMany({
      where: {
        companyId,
        ...(options.cacheType && { cacheType: options.cacheType }),
        ...(options.isActive !== undefined && { isActive: options.isActive })
      },
      orderBy: [
        { hitCount: 'desc' },
        { lastUsedAt: 'desc' }
      ],
      take: options.limit ?? 50
    });
  }
}


