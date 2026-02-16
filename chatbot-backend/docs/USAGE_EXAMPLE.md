# Exemplos de Uso da Arquitetura

## 1. Adicionar Conhecimento ao RAG

```typescript
// Criar base de conhecimento
const knowledgeBase = await prisma.knowledgeBase.create({
  data: {
    companyId: 'company-id',
    title: 'Política de Troca e Devolução',
    category: 'POLICY',
    content: 'Nossa política permite troca ou devolução em até 7 dias...',
    priority: 10,
    isActive: true,
    metadata: {
      tags: ['troca', 'devolução', 'garantia'],
      lastUpdated: new Date()
    }
  }
});

// Dividir em chunks e gerar embeddings
import { createKnowledgeChunkWithVector } from '../utils/vectorUtils';

const chunks = splitIntoChunks(knowledgeBase.content, 500); // 500 tokens por chunk

for (let i = 0; i < chunks.length; i++) {
  const embedding = await generateEmbedding(chunks[i]); // Array de 1536 números
  
  // Usa função utilitária que formata o vector corretamente para pgvector
  await createKnowledgeChunkWithVector({
    knowledgeBaseId: knowledgeBase.id,
    companyId: 'company-id',
    content: chunks[i],
    embedding: embedding, // Array de números será convertido para vector(1536)
    chunkIndex: i,
    tokenCount: countTokens(chunks[i]),
    contentHash: hashContent(chunks[i])
  });
}
```

## 2. Processar Mensagem com Cache

```typescript
async function processMessage(companyId: string, message: string) {
  // 1. Gerar embedding da pergunta
  const queryEmbedding = await generateEmbedding(message);
  
  // 2. Verificar cache semântico
  const cachedResponse = await findSimilarCache(companyId, queryEmbedding, 0.85);
  
  if (cachedResponse) {
    // Atualizar estatísticas do cache
    await prisma.semanticCache.update({
      where: { id: cachedResponse.id },
      data: {
        hitCount: { increment: 1 },
        lastHitAt: new Date()
      }
    });
    
    return {
      response: cachedResponse.response,
      source: 'CACHE',
      confidence: cachedResponse.confidence
    };
  }
  
  // 3. Buscar conhecimento relevante (RAG)
  const relevantChunks = await searchKnowledgeBase(
    companyId, 
    queryEmbedding, 
    { limit: 5, minSimilarity: 0.7 }
  );
  
  // 4. Buscar memórias relevantes
  const memories = await prisma.conversationMemory.findMany({
    where: {
      companyId,
      isActive: true,
      // Buscar memórias relacionadas à pergunta
    }
  });
  
  // 5. Gerar resposta com IA
  const aiResponse = await generateAIResponse({
    message,
    context: {
      knowledge: relevantChunks.map(c => c.content),
      memories: memories.map(m => `${m.key}: ${m.value}`)
    }
  });
  
  // 6. Salvar no cache
  await prisma.semanticCache.create({
    data: {
      companyId,
      queryEmbedding,
      queryText: normalizeText(message),
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      source: 'AI',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    }
  });
  
  return aiResponse;
}
```

## 3. Aprender de Conversas

```typescript
async function learnFromConversation(conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messageLogs: true }
  });
  
  // Analisar conversa e extrair informações
  const analysis = await analyzeConversation(conversation.messageLogs);
  
  // Salvar memórias aprendidas
  for (const memory of analysis.memories) {
    await prisma.conversationMemory.upsert({
      where: {
        companyId_key: {
          companyId: conversation.companyId,
          key: memory.key
        }
      },
      create: {
        companyId: conversation.companyId,
        conversationId,
        memoryType: memory.type,
        key: memory.key,
        value: memory.value,
        confidence: memory.confidence,
        source: 'AI_INFERRED',
        context: memory.context
      },
      update: {
        value: memory.value,
        confidence: memory.confidence,
        lastUsedAt: new Date()
      }
    });
  }
}
```

## 4. Buscar Conhecimento (RAG) com pgvector

```typescript
import { searchSimilarChunks } from '../utils/vectorUtils';

async function searchKnowledgeBase(
  companyId: string,
  queryEmbedding: number[],
  options: { limit: number; minSimilarity: number }
) {
  // Usa a função utilitária que formata o vector corretamente
  const chunks = await searchSimilarChunks(
    companyId,
    queryEmbedding,
    {
      limit: options.limit,
      minSimilarity: options.minSimilarity
    }
  );
  
  // chunks já vem com campo 'similarity' calculado
  return chunks;
}

// Exemplo de uso:
const queryEmbedding = await generateEmbedding("Qual é a política de troca?");
const results = await searchKnowledgeBase(
  'company-id',
  queryEmbedding,
  { limit: 5, minSimilarity: 0.7 }
);
```

## 5. Gerenciar Cache

```typescript
// Limpar caches expirados
async function cleanupExpiredCaches() {
  await prisma.semanticCache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}

// Limpar caches pouco usados (mais de 30 dias sem uso)
async function cleanupUnusedCaches() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  await prisma.semanticCache.deleteMany({
    where: {
      lastHitAt: {
        lt: thirtyDaysAgo
      },
      hitCount: {
        lt: 3 // Menos de 3 hits
      }
    }
  });
}

// Estatísticas de cache
async function getCacheStats(companyId: string) {
  const stats = await prisma.semanticCache.groupBy({
    by: ['source'],
    where: { companyId },
    _count: { id: true },
    _sum: { hitCount: true }
  });
  
  return stats;
}
```

## 6. Log Completo de Mensagem

```typescript
async function logMessage(data: {
  companyId: string;
  conversationId?: string;
  from: 'CLIENT' | 'BOT';
  content: string;
  source: MessageSource;
  metadata?: any;
}) {
  const startTime = Date.now();
  
  // Processar mensagem...
  const response = await processMessage(data.companyId, data.content);
  
  const processingTime = Date.now() - startTime;
  
  // Salvar log
  const messageLog = await prisma.messageLog.create({
    data: {
      companyId: data.companyId,
      conversationId: data.conversationId,
      from: data.from,
      content: data.content,
      source: data.source,
      processingTime,
      aiModel: response.model,
      aiTokens: response.tokens,
      aiCost: response.cost,
      metadata: {
        ...data.metadata,
        userAgent: data.metadata?.userAgent,
        ip: data.metadata?.ip,
        channel: data.metadata?.channel
      }
    }
  });
  
  // Gerar e salvar embedding
  if (data.from === 'CLIENT') {
    const embedding = await generateEmbedding(data.content);
    
    await prisma.messageEmbedding.create({
      data: {
        messageLogId: messageLog.id,
        companyId: data.companyId,
        embedding,
        model: 'text-embedding-ada-002'
      }
    });
  }
  
  return messageLog;
}
```

## 7. Buscar Conversas por Cliente

```typescript
async function getClientConversations(companyId: string, clientPhone: string) {
  const conversations = await prisma.conversation.findMany({
    where: {
      companyId,
      clientPhone
    },
    include: {
      messageLogs: {
        orderBy: { createdAt: 'asc' }
      },
      memories: {
        where: { isActive: true }
      }
    },
    orderBy: { startedAt: 'desc' }
  });
  
  return conversations;
}
```

## 8. Análise e Analytics

```typescript
async function analyzeConversations(companyId: string, dateRange: { start: Date; end: Date }) {
  // Mensagens por período
  const messages = await prisma.messageLog.findMany({
    where: {
      companyId,
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    },
    include: {
      embedding: true
    }
  });
  
  // Estatísticas de cache
  const cacheStats = await getCacheStats(companyId);
  
  // Memórias mais usadas
  const topMemories = await prisma.conversationMemory.findMany({
    where: {
      companyId,
      isActive: true
    },
    orderBy: {
      lastUsedAt: 'desc'
    },
    take: 10
  });
  
  return {
    totalMessages: messages.length,
    cacheHitRate: calculateCacheHitRate(cacheStats),
    topMemories,
    averageResponseTime: calculateAverageResponseTime(messages)
  };
}
```

