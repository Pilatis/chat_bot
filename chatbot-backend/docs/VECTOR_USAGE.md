# Como Usar pgvector no Prisma

Este guia mostra como usar o tipo `vector` do pgvector no Prisma para armazenar e buscar embeddings vetoriais.

## 📋 Pré-requisitos

1. PostgreSQL com extensão pgvector instalada:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Schema do Prisma atualizado com `Unsupported("vector(1536)")`

## 🔧 Configuração

O schema já está configurado para usar `vector(1536)` nos campos:
- `KnowledgeChunk.embedding`
- `ConversationCache.queryEmbedding`

## 💡 Exemplos de Uso

### 1. Criar um KnowledgeChunk com Embedding

```typescript
import { createKnowledgeChunkWithVector } from '../utils/vectorUtils';

// Suponha que você já tem um embedding gerado (array de 1536 números)
const embedding = await generateEmbedding(chunkText); // [0.123, 0.456, ...]

const chunk = await createKnowledgeChunkWithVector({
  knowledgeBaseId: 'kb-uuid',
  companyId: 'company-uuid',
  content: chunkText,
  embedding: embedding, // Array de números
  chunkIndex: 0,
  tokenCount: 500,
  contentHash: hashContent(chunkText)
});
```

### 2. Buscar Chunks Similares (RAG)

```typescript
import { searchSimilarChunks } from '../utils/vectorUtils';

// Gera embedding da pergunta do usuário
const queryEmbedding = await generateEmbedding("Qual é a política de troca?");

// Busca chunks similares
const results = await searchSimilarChunks(
  'company-uuid',
  queryEmbedding,
  {
    limit: 5,           // Top 5 resultados
    minSimilarity: 0.7  // Mínimo 70% de similaridade
  }
);

// results contém:
// - Todos os campos do KnowledgeChunk
// - Campo 'similarity' (0 a 1, onde 1 = idêntico)
results.forEach(result => {
  console.log(`Similaridade: ${result.similarity}`);
  console.log(`Conteúdo: ${result.content}`);
});
```

### 3. Criar Cache com Embedding

```typescript
import { createConversationCacheWithVector } from '../utils/vectorUtils';

const queryEmbedding = await generateEmbedding(userQuestion);

const cache = await createConversationCacheWithVector({
  companyId: 'company-uuid',
  conversationId: 'conversation-uuid',
  queryEmbedding: queryEmbedding,
  queryText: userQuestion,
  response: aiResponse,
  cacheType: 'CACHE',
  source: 'AI',
  confidence: 0.95,
  similarityScore: 0.9,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
});
```

### 4. Buscar Cache Similar

```typescript
import { searchSimilarCaches } from '../utils/vectorUtils';

const queryEmbedding = await generateEmbedding(userQuestion);

const cachedResults = await searchSimilarCaches(
  'company-uuid',
  queryEmbedding,
  {
    limit: 1,
    minSimilarity: 0.85, // 85% de similaridade mínima
    cacheType: 'CACHE',
    isActive: true
  }
);

if (cachedResults.length > 0) {
  // Cache hit! Usa resposta cacheada
  return cachedResults[0].response;
} else {
  // Cache miss, precisa gerar nova resposta
  // ...
}
```

## 🔍 Operadores do pgvector

O pgvector oferece três operadores de distância:

1. **`<=>`** - Distância de Cosseno (recomendado para embeddings)
   - Menor valor = mais similar
   - Para similaridade: `1 - (embedding <=> query)`

2. **`<#>`** - Distância de Produto Interno Negativo
   - Menor valor = mais similar

3. **<->** - Distância Euclidiana
   - Menor valor = mais similar

## 📊 Índices para Performance

Para melhorar a performance de buscas vetoriais, você pode criar índices HNSW:

```sql
-- Índice HNSW para KnowledgeChunk (recomendado para buscas rápidas)
CREATE INDEX ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice HNSW para ConversationCache
CREATE INDEX ON conversation_caches 
USING hnsw ("queryEmbedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

**Nota:** Índices HNSW são mais rápidos para buscas, mas ocupam mais espaço e são mais lentos para inserção.

## ⚠️ Importante

1. **Formato do Vector**: O pgvector espera o formato `[0.1, 0.2, 0.3]` como string
2. **Dimensões**: Certifique-se de que todos os embeddings têm 1536 dimensões
3. **NULL**: Campos `vector` podem ser `NULL`, mas buscas não funcionarão com valores NULL
4. **Migração**: Ao migrar de JSON para vector, você precisará converter os dados existentes

## 🔄 Migração de Dados Existentes

Se você já tinha embeddings em formato JSON, pode migrá-los assim:

```sql
-- Atualizar embeddings existentes de JSON para vector
UPDATE knowledge_chunks
SET embedding = embedding::text::vector(1536)
WHERE embedding IS NOT NULL
  AND embedding::text != 'null';
```

## 📚 Referências

- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Prisma Unsupported Types](https://www.prisma.io/docs/concepts/components/prisma-schema/data-model#unsupported-types)



