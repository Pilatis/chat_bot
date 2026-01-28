import { PrismaClient } from '@prisma/client';
import { searchSimilarChunks, createKnowledgeChunkWithVector } from '../utils/vectorUtils';
import { EmbeddingService } from './embedding.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Serviço RAG (Retrieval Augmented Generation)
 * 
 * Responsável por:
 * - Gerenciar base de conhecimento (KnowledgeBase e KnowledgeChunk)
 * - Buscar chunks relevantes usando busca vetorial
 * - Processar e chunking de documentos
 */
export class RAGService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  /**
   * Busca chunks relevantes para uma query usando busca vetorial
   * 
   * @param companyId - ID da empresa
   * @param query - Texto da pergunta/query
   * @param options - Opções de busca
   * @returns Array de chunks ordenados por similaridade
   */
  async searchRelevantKnowledge(
    companyId: string,
    query: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      categories?: string[];
    } = {}
  ) {
    const limit = options.limit ?? 5;
    const minSimilarity = options.minSimilarity ?? 0.7;

    // Gera embedding da query
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    // Busca chunks similares
    const chunks = await searchSimilarChunks(companyId, queryEmbedding, {
      limit,
      minSimilarity
    });

    // Se houver filtro de categorias, aplica
    if (options.categories && options.categories.length > 0) {
      return chunks.filter((chunk: any) => 
        options.categories!.includes(chunk.category)
      );
    }

    return chunks;
  }

  /**
   * Cria uma base de conhecimento
   */
  async createKnowledgeBase(data: {
    companyId: string;
    title: string;
    category: 'PRODUCT' | 'SERVICE' | 'POLICY' | 'FAQ' | 'COMPANY_INFO' | 'CUSTOM';
    content: string;
    priority?: number;
    metadata?: any;
  }) {
    return await prisma.knowledgeBase.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        category: data.category,
        content: data.content,
        priority: data.priority ?? 0,
        metadata: data.metadata,
        isActive: true
      }
    });
  }

  /**
   * Processa e cria chunks de uma base de conhecimento
   * Divide o conteúdo em chunks e gera embeddings
   * 
   * @param knowledgeBaseId - ID da base de conhecimento
   * @param content - Conteúdo para processar
   * @param chunkSize - Tamanho máximo do chunk em tokens (padrão: 500)
   * @param overlap - Sobreposição entre chunks em tokens (padrão: 50)
   */
  async processKnowledgeBase(
    knowledgeBaseId: string,
    content: string,
    chunkSize: number = 500,
    overlap: number = 50
  ) {
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeBaseId }
    });

    if (!knowledgeBase) {
      throw new Error('Base de conhecimento não encontrada');
    }

    // Divide conteúdo em chunks
    const chunks = this.splitIntoChunks(content, chunkSize, overlap);

    // Gera embeddings em lote (mais eficiente)
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await this.embeddingService.generateEmbeddingsBatch(texts);

    // Cria chunks no banco
    const createdChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = embeddings[i];
      const contentHash = this.hashContent(chunk.text);

      // Verifica se chunk já existe (evita duplicatas)
      const existingChunk = await prisma.knowledgeChunk.findFirst({
        where: {
          knowledgeBaseId,
          contentHash
        }
      });

      if (existingChunk) {
        // Atualiza embedding se necessário
        if (!existingChunk.embedding) {
          await prisma.$executeRaw`
            UPDATE knowledge_chunks
            SET embedding = ${this.formatVector(embedding)}::vector(1536)
            WHERE id = ${existingChunk.id}::uuid
          `;
        }
        createdChunks.push(existingChunk);
        continue;
      }

      // Cria novo chunk
      const created = await createKnowledgeChunkWithVector({
        knowledgeBaseId,
        companyId: knowledgeBase.companyId,
        content: chunk.text,
        embedding,
        chunkIndex: i,
        tokenCount: chunk.tokenCount,
        contentHash
      });

      createdChunks.push(created);
    }

    return createdChunks;
  }

  /**
   * Divide texto em chunks com sobreposição
   */
  private splitIntoChunks(
    text: string,
    chunkSize: number,
    overlap: number
  ): Array<{ text: string; tokenCount: number }> {
    // Aproximação: 1 token ≈ 4 caracteres
    const charChunkSize = chunkSize * 4;
    const charOverlap = overlap * 4;

    const chunks: Array<{ text: string; tokenCount: number }> = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + charChunkSize, text.length);
      const chunkText = text.slice(start, end).trim();

      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          tokenCount: Math.ceil(chunkText.length / 4)
        });
      }

      // Move para próximo chunk com sobreposição
      start = end - charOverlap;
      if (start >= text.length) break;
    }

    return chunks;
  }

  /**
   * Gera hash do conteúdo para evitar duplicatas
   */
  private hashContent(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Formata vetor para string (compatível com pgvector)
   */
  private formatVector(embedding: number[]): string {
    return `[${embedding.join(',')}]`;
  }

  /**
   * Atualiza uma base de conhecimento e reprocessa chunks
   */
  async updateKnowledgeBase(
    knowledgeBaseId: string,
    data: {
      title?: string;
      category?: string;
      content?: string;
      priority?: number;
      isActive?: boolean;
    }
  ) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.category) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const knowledgeBase = await prisma.knowledgeBase.update({
      where: { id: knowledgeBaseId },
      data: updateData
    });

    // Se o conteúdo mudou, reprocessa chunks
    if (data.content) {
      // Remove chunks antigos
      await prisma.knowledgeChunk.deleteMany({
        where: { knowledgeBaseId }
      });

      // Cria novos chunks
      await this.processKnowledgeBase(knowledgeBaseId, data.content);
    }

    return knowledgeBase;
  }

  /**
   * Lista bases de conhecimento de uma empresa
   */
  async listKnowledgeBases(
    companyId: string,
    options: {
      category?: string;
      isActive?: boolean;
    } = {}
  ) {
    return await prisma.knowledgeBase.findMany({
      where: {
        companyId,
        ...(options.category && { category: options.category as any }),
        ...(options.isActive !== undefined && { isActive: options.isActive })
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            tokenCount: true
          }
        }
      }
    });
  }

  /**
   * Deleta uma base de conhecimento e seus chunks
   */
  async deleteKnowledgeBase(knowledgeBaseId: string) {
    return await prisma.knowledgeBase.delete({
      where: { id: knowledgeBaseId }
    });
  }
}


