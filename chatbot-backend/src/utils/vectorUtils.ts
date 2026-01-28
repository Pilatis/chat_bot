import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utilitários para trabalhar com embeddings vetoriais usando pgvector
 */

/**
 * Converte um array de números em formato string para uso com pgvector
 * O pgvector espera o formato: '[0.1, 0.2, 0.3]' como string
 */
export function formatVectorForPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Cria um KnowledgeChunk com embedding vetorial
 * 
 * @example
 * const embedding = await generateEmbedding(chunkText); // Array de 1536 números
 * await createKnowledgeChunkWithVector({
 *   knowledgeBaseId: 'kb-id',
 *   companyId: 'company-id',
 *   content: chunkText,
 *   embedding: embedding,
 *   chunkIndex: 0
 * });
 */
export async function createKnowledgeChunkWithVector(data: {
  knowledgeBaseId: string;
  companyId: string;
  content: string;
  embedding: number[];
  chunkIndex: number;
  tokenCount?: number;
  metadata?: any;
  contentHash: string;
}) {
  // Converte o array para formato string que o pgvector aceita
  const vectorString = formatVectorForPgVector(data.embedding);

  // Usa $queryRaw para inserir o vector corretamente
  const result = await prisma.$queryRaw`
    INSERT INTO knowledge_chunks (
      id,
      "knowledgeBaseId",
      "companyId",
      content,
      embedding,
      "chunkIndex",
      "tokenCount",
      metadata,
      "contentHash",
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${data.knowledgeBaseId}::uuid,
      ${data.companyId}::uuid,
      ${data.content},
      ${vectorString}::vector(1536),
      ${data.chunkIndex},
      ${data.tokenCount ?? null},
      ${data.metadata ? JSON.stringify(data.metadata) : null}::jsonb,
      ${data.contentHash},
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  return result;
}

/**
 * Busca chunks similares usando busca vetorial com pgvector
 * Usa o operador <=> (distância de cosseno) do pgvector
 * 
 * @param queryEmbedding - Array de números representando o embedding da query
 * @param options - Opções de busca
 * @returns Array de chunks ordenados por similaridade
 * 
 * @example
 * const queryEmbedding = await generateEmbedding("Qual é a política de troca?");
 * const results = await searchSimilarChunks(
 *   'company-id',
 *   queryEmbedding,
 *   { limit: 5, minSimilarity: 0.7 }
 * );
 */
export async function searchSimilarChunks(
  companyId: string,
  queryEmbedding: number[],
  options: { limit?: number; minSimilarity?: number } = {}
) {
  const limit = options.limit ?? 10;
  const minSimilarity = options.minSimilarity ?? 0.0;

  const vectorString = formatVectorForPgVector(queryEmbedding);

  // Busca usando similaridade de cosseno (1 - distância)
  // <=> é o operador de distância de cosseno do pgvector
  const results = await prisma.$queryRaw<any[]>`
    SELECT 
      kc.id,
      kc."knowledgeBaseId",
      kc."companyId",
      kc.content,
      kc."chunkIndex",
      kc."tokenCount",
      kc.metadata,
      kc."contentHash",
      kc."createdAt",
      kc."updatedAt",
      kb.title,
      kb.category,
      kb.priority,
      -- Calcula similaridade: 1 - distância de cosseno
      -- Quanto maior, mais similar (0 a 1)
      1 - (kc.embedding <=> ${vectorString}::vector(1536)) as similarity
    FROM knowledge_chunks kc
    JOIN knowledge_bases kb ON kc."knowledgeBaseId" = kb.id
    WHERE 
      kc."companyId" = ${companyId}::uuid
      AND kb."isActive" = true
      AND kc.embedding IS NOT NULL
      AND 1 - (kc.embedding <=> ${vectorString}::vector(1536)) >= ${minSimilarity}
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Cria um ConversationCache com embedding vetorial
 */
export async function createConversationCacheWithVector(data: {
  companyId: string;
  conversationId?: string;
  queryEmbedding: number[];
  queryText?: string;
  response?: string;
  cacheType: 'CACHE' | 'MEMORY' | 'HYBRID';
  memoryType?: 'PREFERENCE' | 'CONTEXT' | 'FACT' | 'PATTERN' | 'INTENT';
  key?: string;
  value?: string;
  confidence?: number;
  similarityScore?: number;
  source: 'RAG' | 'MEMORY' | 'AI' | 'HYBRID';
  context?: any;
  expiresAt?: Date;
  metadata?: any;
}) {
  const vectorString = formatVectorForPgVector(data.queryEmbedding);

  const result = await prisma.$queryRaw`
    INSERT INTO conversation_caches (
      id,
      "companyId",
      "conversationId",
      "queryEmbedding",
      "queryText",
      response,
      "cacheType",
      "memoryType",
      key,
      value,
      confidence,
      "similarityScore",
      source,
      context,
      "isActive",
      "hitCount",
      "expiresAt",
      metadata,
      "createdAt",
      "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${data.companyId}::uuid,
      ${data.conversationId ? data.conversationId : null}::uuid,
      ${vectorString}::vector(1536),
      ${data.queryText ?? null},
      ${data.response ?? null},
      ${data.cacheType}::"CacheType",
      ${data.memoryType ? data.memoryType : null}::"MemoryType",
      ${data.key ?? null},
      ${data.value ?? null},
      ${data.confidence ?? 1.0},
      ${data.similarityScore ?? null},
      ${data.source}::"CacheSource",
      ${data.context ? JSON.stringify(data.context) : null}::jsonb,
      true,
      0,
      ${data.expiresAt ?? null}::timestamp,
      ${data.metadata ? JSON.stringify(data.metadata) : null}::jsonb,
      NOW(),
      NOW()
    )
    RETURNING *
  `;

  return result;
}

/**
 * Busca caches similares usando busca vetorial
 */
export async function searchSimilarCaches(
  companyId: string,
  queryEmbedding: number[],
  options: {
    limit?: number;
    minSimilarity?: number;
    cacheType?: 'CACHE' | 'MEMORY' | 'HYBRID';
    isActive?: boolean;
  } = {}
) {
  const limit = options.limit ?? 5;
  const minSimilarity = options.minSimilarity ?? 0.8;
  const isActive = options.isActive ?? true;

  const vectorString = formatVectorForPgVector(queryEmbedding);

  // Se cacheType for especificado, usa query com filtro adicional
  if (options.cacheType) {
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        cc.*,
        1 - (cc."queryEmbedding" <=> ${vectorString}::vector(1536)) as similarity
      FROM conversation_caches cc
      WHERE 
        cc."companyId" = ${companyId}::uuid
        AND cc."isActive" = ${isActive}
        AND cc."cacheType" = ${options.cacheType}::"CacheType"
        AND cc."queryEmbedding" IS NOT NULL
        AND 1 - (cc."queryEmbedding" <=> ${vectorString}::vector(1536)) >= ${minSimilarity}
        AND (cc."expiresAt" IS NULL OR cc."expiresAt" > NOW())
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    return results;
  }

  // Query sem filtro de cacheType
  const results = await prisma.$queryRaw<any[]>`
    SELECT 
      cc.*,
      1 - (cc."queryEmbedding" <=> ${vectorString}::vector(1536)) as similarity
    FROM conversation_caches cc
    WHERE 
      cc."companyId" = ${companyId}::uuid
      AND cc."isActive" = ${isActive}
      AND cc."queryEmbedding" IS NOT NULL
      AND 1 - (cc."queryEmbedding" <=> ${vectorString}::vector(1536)) >= ${minSimilarity}
      AND (cc."expiresAt" IS NULL OR cc."expiresAt" > NOW())
    ORDER BY similarity DESC
    LIMIT ${limit}
  `;

  return results;
}

/**
 * Atualiza o embedding de um KnowledgeChunk existente
 */
export async function updateKnowledgeChunkEmbedding(
  chunkId: string,
  embedding: number[]
) {
  const vectorString = formatVectorForPgVector(embedding);

  const result = await prisma.$queryRaw`
    UPDATE knowledge_chunks
    SET 
      embedding = ${vectorString}::vector(1536),
      "updatedAt" = NOW()
    WHERE id = ${chunkId}::uuid
    RETURNING *
  `;

  return result;
}

/**
 * Operadores do pgvector:
 * - <=> : Distância de cosseno (menor = mais similar)
 * - <#> : Distância de produto interno negativo (menor = mais similar)
 * - <-> : Distância euclidiana (menor = mais similar)
 * 
 * Para similaridade (maior = mais similar), use: 1 - (embedding <=> query)
 */

