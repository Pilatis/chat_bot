import { PrismaClient } from '@prisma/client';
import { trainAIWithCompanyData, generateAIResponse, TrainingData } from '../../utils/trainAI';
import { AnalyticsService } from '../analytics/analytics.service';
import { RAGService } from '../../services/rag.service';
import { SemanticCacheService } from '../../services/semantic-cache.service';
import { MemoryService } from '../../services/memory.service';
import { LogService } from '../../services/log.service';
import { EmbeddingService } from '../../services/embedding.service';

const prisma = new PrismaClient();
const analyticsService = new AnalyticsService();

export interface ChatMessage {
  message: string;
  conversationId?: string;
  clientPhone?: string;
  clientName?: string;
  source?: 'WHATSAPP' | 'WEB_CHAT' | 'API' | 'TEST' | 'SYSTEM';
  metadata?: any;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
  source?: 'CACHE' | 'RAG' | 'MEMORY' | 'AI' | 'HYBRID';
  cacheHit?: boolean;
}

export class ChatbotService {
  private ragService: RAGService;
  private cacheService: SemanticCacheService;
  private memoryService: MemoryService;
  private logService: LogService;
  private embeddingService: EmbeddingService;

  constructor() {
    this.ragService = new RAGService();
    this.cacheService = new SemanticCacheService();
    this.memoryService = new MemoryService();
    this.logService = new LogService();
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Processa uma mensagem usando a arquitetura RAG completa:
   * 1. Log Layer - Registra mensagem
   * 2. Cache Layer - Verifica cache semântico
   * 3. RAG Layer - Busca conhecimento relevante
   * 4. Memory Layer - Recupera memórias relevantes
   * 5. Gera resposta com IA
   * 6. Salva cache, memórias e logs
   */
  async processMessage(
    companyId: string,
    userId: string,
    message: ChatMessage
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    const withConversationId = (conversationId?: string) =>
      conversationId ? { conversationId } : {};

    const normalizeCacheSource = (
      source?: ChatResponse['source']
    ): 'RAG' | 'MEMORY' | 'AI' | 'HYBRID' => {
      // O SemanticCacheService não aceita "CACHE" como source.
      if (!source || source === 'CACHE') return 'AI';
      return source;
    };

    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId },
      include: {
        products: true,
        services: true
      }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // 1. LOG LAYER - Registra mensagem do cliente
    const clientMessageLog = await this.logService.logMessage({
      companyId,
      ...withConversationId(message.conversationId),
      from: 'CLIENT',
      content: message.message,
      source: message.source || 'API',
      metadata: {
        clientPhone: message.clientPhone,
        clientName: message.clientName,
        ...message.metadata
      }
    });

    // Obtém ou cria conversa
    let conversationId = message.conversationId;
    if (!conversationId && message.clientPhone) {
      // Busca conversa ativa ou cria nova
      let conversation = await prisma.conversation.findFirst({
        where: {
          companyId,
          clientPhone: message.clientPhone,
          status: 'ACTIVE'
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            companyId,
            clientPhone: message.clientPhone,
            clientName: message.clientName ?? null,
            status: 'ACTIVE'
          }
        });
      }

      conversationId = conversation.id;
    }

    // 2. CACHE LAYER - Verifica cache semântico
    const cachedResponse = await this.cacheService.findCachedResponse(
      companyId,
      message.message,
      { minSimilarity: 0.85 }
    );

    if (cachedResponse) {
      // Cache hit! Retorna resposta cacheada
      const processingTime = Date.now() - startTime;

      // Log da resposta do bot
      await this.logService.logMessage({
        companyId,
        ...withConversationId(conversationId),
        from: 'BOT',
        content: cachedResponse.response,
        source: message.source || 'API',
        metadata: {
          processingTime,
          cacheHit: true,
          cacheId: cachedResponse.cacheId,
          similarity: cachedResponse.similarity
        }
      });

      // Atualiza analytics de forma assíncrona
      analyticsService.calculateAndStoreDailyAnalytics(companyId, new Date())
        .catch(err => console.error('Erro ao atualizar analytics:', err));

      return {
        response: cachedResponse.response,
        confidence: cachedResponse.confidence,
        source: 'CACHE',
        cacheHit: true
      };
    }

    // 3. RAG LAYER - Busca conhecimento relevante
    let knowledgeContext = '';
    try {
      const relevantChunks = await this.ragService.searchRelevantKnowledge(
        companyId,
        message.message,
        { limit: 5, minSimilarity: 0.7 }
      );

      if (relevantChunks.length > 0) {
        knowledgeContext = relevantChunks
          .map((chunk: any) => `[${chunk.category}] ${chunk.content}`)
          .join('\n\n');
      }
    } catch (error) {
      console.error('Erro ao buscar conhecimento RAG:', error);
      // Continua sem contexto RAG se houver erro
    }

    // 4. MEMORY LAYER - Recupera memórias relevantes
    let memoryContext = '';
    try {
      const memories = await this.memoryService.findRelevantMemories(
        companyId,
        message.message,
        {
          ...withConversationId(conversationId),
          limit: 3,
          minSimilarity: 0.75
        }
      );

      if (memories.length > 0) {
        memoryContext = memories
          .map(m => `[${m.memoryType}] ${m.key}: ${m.value}`)
          .join('\n');
      }
    } catch (error) {
      console.error('Erro ao buscar memórias:', error);
      // Continua sem contexto de memória se houver erro
    }

    // 5. Gera resposta com IA usando contexto
    let aiResponse: ChatResponse;
    let aiTokens = 0;
    let aiCost = 0;
    let aiModel = 'local';

    try {
      // Prepara contexto completo
      const productsBlock = company.products.length > 0
        ? `Produtos:\n${company.products.map(p => `- ${p.name}: ${p.description || ''} (R$ ${p.price || 0})`).join('\n')}`
        : '';
      const servicesBlock = company.services.length > 0
        ? `Serviços:\n${company.services.map(s => `- ${s.name}: ${s.description || ''} (R$ ${s.price || 0})`).join('\n')}`
        : '';
      const fullContext = [
        knowledgeContext && `Conhecimento da Empresa:\n${knowledgeContext}`,
        memoryContext && `Memórias do Cliente:\n${memoryContext}`,
        productsBlock,
        servicesBlock
      ].filter(Boolean).join('\n\n');

      // Usa função de IA existente (pode ser substituída por OpenAI)
      const trainingData: TrainingData = {
        companyName: company.name,
        companyDescription: company.description || '',
        whatsappNumber: company.whatsappNumber || '',
        products: company.products.map(product => ({
          name: product.name,
          description: product.description || '',
          price: product.price || 0
        })),
        services: company.services.map(service => ({
          name: service.name,
          description: service.description || '',
          price: service.price || 0
        }))
      };

      const trainingDataString = trainAIWithCompanyData(trainingData);
      
      // Adiciona contexto RAG e Memory ao prompt
      const enhancedMessage = fullContext 
        ? `${message.message}\n\nContexto:\n${fullContext}`
        : message.message;

      aiResponse = generateAIResponse(enhancedMessage, trainingDataString);
      aiResponse.source = knowledgeContext ? 'RAG' : memoryContext ? 'MEMORY' : 'AI';
      
      // Simula tokens e custo (em produção, use valores reais da API)
      aiTokens = Math.ceil(enhancedMessage.length / 4) + Math.ceil(aiResponse.response.length / 4);
      aiCost = aiTokens * 0.0001; // Exemplo: $0.0001 por token
      aiModel = 'text-davinci-003'; // Exemplo
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      // Fallback para resposta padrão
      aiResponse = {
        response: `Olá! Como posso ajudá-lo(a) hoje?`,
        confidence: 0.5,
        source: 'AI'
      };
    }

    const processingTime = Date.now() - startTime;

    // 6. LOG LAYER - Registra resposta do bot
    await this.logService.logMessage({
      companyId,
      ...withConversationId(conversationId),
      from: 'BOT',
      content: aiResponse.response,
      source: message.source || 'API',
      metadata: {
        processingTime,
        aiModel,
        aiTokens,
        aiCost,
        cacheHit: false,
        hasRAGContext: !!knowledgeContext,
        hasMemoryContext: !!memoryContext
      }
    });

    // 7. CACHE LAYER - Salva resposta no cache (assíncrono)
    this.cacheService.saveCache({
      companyId,
      ...withConversationId(conversationId),
      query: message.message,
      response: aiResponse.response,
      source: normalizeCacheSource(aiResponse.source),
      confidence: aiResponse.confidence
    }).catch(err => console.error('Erro ao salvar cache:', err));

    // 8. MEMORY LAYER - Extrai e salva memórias da conversa (assíncrono)
    if (conversationId) {
      const conversationMessages = await this.logService.getConversationMessages(
        conversationId,
        { limit: 20 }
      );

      this.memoryService.extractMemoriesFromConversation(
        companyId,
        conversationId,
        conversationMessages.map(m => ({
          from: m.from,
          content: m.content
        }))
      ).catch(err => console.error('Erro ao extrair memórias:', err));
    }

    // Atualiza analytics de forma assíncrona
    analyticsService.calculateAndStoreDailyAnalytics(companyId, new Date())
      .catch(err => console.error('Erro ao atualizar analytics:', err));

    return aiResponse;
  }

  async trainAI(companyId: string, userId: string): Promise<{ message: string; trainedData: any }> {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId },
      include: {
        products: true,
        services: true
      }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const trainingData: TrainingData = {
      companyName: company.name,
      companyDescription: company.description || '',
      whatsappNumber: company.whatsappNumber || '',
      products: company.products.map(product => ({
        name: product.name,
        description: product.description || '',
        price: product.price || 0
      })),
      services: company.services.map(service => ({
        name: service.name,
        description: service.description || '',
        price: service.price || 0
      }))
    };

    // Processar dados de treinamento
    const trainedDataString = trainAIWithCompanyData(trainingData);
    const trainedData = JSON.parse(trainedDataString);

    // Salvar dados de treinamento no banco
    await prisma.trainingData.create({
      data: {
        companyId,
        data: trainedData
      }
    });

    return {
      message: 'IA treinada com sucesso com os dados da empresa',
      trainedData
    };
  }

  async getTrainingHistory(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const trainingHistory = await prisma.trainingData.findMany({
      where: { companyId },
      orderBy: { trainedAt: 'desc' },
      select: {
        id: true,
        trainedAt: true,
        data: true
      }
    });

    return trainingHistory;
  }

  async getChatHistory(companyId: string, userId: string, limit: number = 50) {
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

  async getChatStats(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const stats = await prisma.message.groupBy({
      by: ['from'],
      where: { companyId },
      _count: {
        id: true
      }
    });

    const totalMessages = await prisma.message.count({
      where: { companyId }
    });

    const todayMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return {
      totalMessages,
      todayMessages,
      byType: stats.reduce((acc, stat) => {
        acc[stat.from.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
