import { PrismaClient } from '@prisma/client';
import { searchSimilarCaches, createConversationCacheWithVector } from '../utils/vectorUtils';
import { EmbeddingService } from './embedding.service';

const prisma = new PrismaClient();

/**
 * Serviço de Memória (Memory Layer)
 * 
 * Responsável por:
 * - Armazenar e recuperar memórias aprendidas das conversas
 * - Gerenciar diferentes tipos de memória (PREFERENCE, CONTEXT, FACT, PATTERN, INTENT)
 * - Buscar memórias relevantes para contexto
 */
export class MemoryService {
  private embeddingService: EmbeddingService;
  private readonly defaultMinSimilarity: number = 0.75;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Busca memórias relevantes para uma query
   * 
   * @param companyId - ID da empresa
   * @param conversationId - ID da conversa (opcional)
   * @param query - Texto da pergunta/contexto
   * @param options - Opções de busca
   * @returns Array de memórias relevantes
   */
  async findRelevantMemories(
    companyId: string,
    query: string,
    options: {
      conversationId?: string;
      memoryTypes?: Array<'PREFERENCE' | 'CONTEXT' | 'FACT' | 'PATTERN' | 'INTENT'>;
      limit?: number;
      minSimilarity?: number;
    } = {}
  ) {
    const limit = options.limit ?? 5;
    const minSimilarity = options.minSimilarity ?? this.defaultMinSimilarity;

    // Gera embedding da query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Busca memórias similares usando ConversationCache com cacheType MEMORY
    const memories = await searchSimilarCaches(companyId, queryEmbedding, {
      limit,
      minSimilarity,
      cacheType: 'MEMORY',
      isActive: true
    });

    // Filtra por conversationId se fornecido
    let filteredMemories = memories;
    if (options.conversationId) {
      filteredMemories = memories.filter((m: any) => 
        m.conversationId === options.conversationId
      );
    }

    // Filtra por tipos de memória se fornecidos
    if (options.memoryTypes && options.memoryTypes.length > 0) {
      filteredMemories = filteredMemories.filter((m: any) =>
        options.memoryTypes!.includes(m.memoryType)
      );
    }

    return filteredMemories.map((m: any) => ({
      id: m.id,
      key: m.key,
      value: m.value,
      memoryType: m.memoryType,
      confidence: m.confidence,
      similarity: m.similarity,
      source: m.source,
      context: m.context,
      createdAt: m.createdAt
    }));
  }

  /**
   * Salva uma memória
   * 
   * @param data - Dados da memória
   */
  async saveMemory(data: {
    companyId: string;
    conversationId?: string;
    key: string;
    value: string;
    memoryType: 'PREFERENCE' | 'CONTEXT' | 'FACT' | 'PATTERN' | 'INTENT';
    confidence?: number;
    source?: 'CONVERSATION' | 'MANUAL' | 'AI_INFERRED' | 'SYSTEM';
    context?: any;
    metadata?: any;
  }) {
    // Gera embedding da chave (key) para busca semântica
    const queryEmbedding = await this.embeddingService.generateEmbedding(
      `${data.key}: ${data.value}`
    );

    // Verifica se já existe memória similar
    const existing = await searchSimilarCaches(data.companyId, queryEmbedding, {
      limit: 1,
      minSimilarity: 0.9,
      cacheType: 'MEMORY',
      isActive: true
    });

    if (existing.length > 0) {
      // Atualiza memória existente
      return await prisma.conversationCache.update({
        where: { id: existing[0].id },
        data: {
          value: data.value,
          confidence: data.confidence ?? existing[0].confidence,
          context: data.context as any,
          metadata: data.metadata as any,
          updatedAt: new Date()
        }
      });
    }

    // Cria nova memória (conversationId só entra se definido, por causa de exactOptionalPropertyTypes)
    return await createConversationCacheWithVector({
      companyId: data.companyId,
      ...(data.conversationId !== undefined && { conversationId: data.conversationId }),
      queryEmbedding,
      queryText: `${data.key}: ${data.value}`,
      cacheType: 'MEMORY',
      memoryType: data.memoryType,
      key: data.key,
      value: data.value,
      confidence: data.confidence ?? 1.0,
      source: (data.source || 'CONVERSATION') as any,
      context: data.context,
      metadata: data.metadata
    });
  }

  /**
   * Extrai e salva memórias de uma conversa
   * Usa IA para identificar informações importantes
   * 
   * @param conversationId - ID da conversa
   * @param messages - Array de mensagens da conversa
   */
  async extractMemoriesFromConversation(
    companyId: string,
    conversationId: string,
    messages: Array<{ from: 'CLIENT' | 'BOT'; content: string }>
  ) {
    // Agrupa mensagens do cliente
    const clientMessages = messages
      .filter(m => m.from === 'CLIENT')
      .map(m => m.content)
      .join(' ');

    if (clientMessages.length === 0) {
      return [];
    }

    // TODO: Aqui você pode usar IA para extrair memórias automaticamente
    // Por enquanto, vamos salvar memórias básicas baseadas em padrões

    const memories: Array<{ type: string; value?: string; key?: string }> = [];

    // Extrai preferências (palavras-chave como "prefiro", "gosto", etc)
    if (this.containsPreference(clientMessages)) {
      const preference = this.extractPreference(clientMessages);
      if (preference) {
        await this.saveMemory({
          companyId,
          conversationId,
          key: 'preference',
          value: preference,
          memoryType: 'PREFERENCE',
          source: 'AI_INFERRED',
          confidence: 0.7
        });
        memories.push({ type: 'PREFERENCE', value: preference });
      }
    }

    // Extrai fatos (nomes, emails, telefones, etc)
    const facts = this.extractFacts(clientMessages);
    for (const fact of facts) {
      await this.saveMemory({
        companyId,
        conversationId,
        key: fact.key,
        value: fact.value,
        memoryType: 'FACT',
        source: 'CONVERSATION',
        confidence: 0.9
      });
      memories.push({ type: 'FACT', key: fact.key, value: fact.value });
    }

    return memories;
  }

  /**
   * Verifica se texto contém preferências
   */
  private containsPreference(text: string): boolean {
    const preferenceKeywords = ['prefiro', 'gosto', 'preferência', 'melhor', 'favorito'];
    const lowerText = text.toLowerCase();
    return preferenceKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Extrai preferência do texto
   */
  private extractPreference(text: string): string | null {
    // Implementação básica - pode ser melhorada com IA
    const lowerText = text.toLowerCase();
    if (lowerText.includes('prefiro')) {
      const match = text.match(/prefiro\s+(.+?)(?:\.|,|$)/i);
      const value = match?.[1];
      return value ? value.trim() : null;
    }
    return null;
  }

  /**
   * Extrai fatos do texto (nomes, emails, telefones)
   */
  private extractFacts(text: string): Array<{ key: string; value: string }> {
    const facts: Array<{ key: string; value: string }> = [];

    // Extrai email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      facts.push({ key: 'email', value: emails[0] });
    }

    // Extrai telefone (formato brasileiro)
    const phoneRegex = /(\+?55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-.\s]?\d{4})/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      facts.push({ key: 'phone', value: phones[0].replace(/\D/g, '') });
    }

    // Extrai nome (padrão básico: "meu nome é X" ou "sou o X")
    const namePatterns = [
      /(?:meu\s+nome\s+é|sou\s+o|sou\s+a|chamo-me)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /nome[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        facts.push({ key: 'name', value: match[1].trim() });
        break;
      }
    }

    return facts;
  }

  /**
   * Lista todas as memórias de uma empresa ou conversa
   */
  async listMemories(
    companyId: string,
    options: {
      conversationId?: string;
      memoryType?: 'PREFERENCE' | 'CONTEXT' | 'FACT' | 'PATTERN' | 'INTENT';
      isActive?: boolean;
    } = {}
  ) {
    return await prisma.conversationCache.findMany({
      where: {
        companyId,
        cacheType: 'MEMORY',
        ...(options.conversationId && { conversationId: options.conversationId }),
        ...(options.memoryType && { memoryType: options.memoryType }),
        ...(options.isActive !== undefined && { isActive: options.isActive })
      },
      orderBy: [
        { confidence: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  /**
   * Deleta uma memória
   */
  async deleteMemory(memoryId: string) {
    return await prisma.conversationCache.update({
      where: { id: memoryId },
      data: { isActive: false }
    });
  }

  /**
   * Atualiza uma memória
   */
  async updateMemory(
    memoryId: string,
    data: {
      value?: string;
      confidence?: number;
      context?: any;
    }
  ) {
    return await prisma.conversationCache.update({
      where: { id: memoryId },
      data: {
        ...(data.value && { value: data.value }),
        ...(data.confidence !== undefined && { confidence: data.confidence }),
        ...(data.context && { context: data.context as any }),
        updatedAt: new Date()
      }
    });
  }
}


