# 🚀 Implementação da Arquitetura RAG Completa

Este documento explica como usar a arquitetura RAG implementada com as 4 camadas:
- **RAG Layer** - Busca de conhecimento
- **Cache Semântico** - Cache inteligente
- **Memory Layer** - Memórias aprendidas
- **Log Layer** - Logging completo

## 📋 Pré-requisitos

1. ✅ PostgreSQL com pgvector instalado
2. ✅ Extensão `vector` habilitada no banco
3. ⚠️ OpenAI API Key (opcional - funciona sem ela usando embeddings simulados)

## 🔧 Configuração Inicial

### 1. Instalar pgvector no PostgreSQL

```sql
-- Execute no seu banco de dados
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Criar Índices HNSW (Opcional mas Recomendado)

Execute o script para melhorar performance das buscas vetoriais:

```bash
# Conecte-se ao banco e execute:
psql -U postgres -d chatbot_db -f prisma/create-hnsw-indexes.sql
```

Ou execute manualmente:

```sql
-- Índice para KnowledgeChunk
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice para ConversationCache
CREATE INDEX IF NOT EXISTS conversation_caches_query_embedding_idx 
ON conversation_caches 
USING hnsw ("queryEmbedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### 3. Configurar Variáveis de Ambiente (Opcional)

Se você tiver OpenAI API Key:

```env
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Nota:** Sem a API key, o sistema usa embeddings simulados (funciona para desenvolvimento/testes).

## 📚 Como Usar

### 1. Criar Base de Conhecimento (RAG Layer)

```typescript
import { RAGService } from '../services/rag.service';

const ragService = new RAGService();

// Criar base de conhecimento
const knowledgeBase = await ragService.createKnowledgeBase({
  companyId: 'company-uuid',
  title: 'Política de Troca',
  category: 'POLICY',
  content: 'Nossa política de troca permite...',
  priority: 10
});

// Processar e criar chunks com embeddings
await ragService.processKnowledgeBase(
  knowledgeBase.id,
  knowledgeBase.content,
  500, // chunkSize em tokens
  50   // overlap em tokens
);
```

### 2. Processar Mensagem com Arquitetura Completa

O `ChatbotService` já está integrado com todas as camadas:

```typescript
import { ChatbotService } from '../modules/chatbot/chatbot.service';

const chatbotService = new ChatbotService();

const response = await chatbotService.processMessage(
  'company-uuid',
  'user-uuid',
  {
    message: 'Qual é a política de troca?',
    conversationId: 'conversation-uuid', // opcional
    clientPhone: '+5511999999999',      // opcional
    source: 'WEB_CHAT'                 // opcional
  }
);

// Response contém:
// - response: string (resposta do bot)
// - confidence: number (confiança 0-1)
// - source: 'CACHE' | 'RAG' | 'MEMORY' | 'AI' | 'HYBRID'
// - cacheHit: boolean (se veio do cache)
```

### 3. Fluxo Automático

Quando você processa uma mensagem, o sistema:

1. **Log Layer** - Registra a mensagem do cliente
2. **Cache Layer** - Verifica se há resposta cacheada similar
   - Se encontrar (similaridade > 85%), retorna imediatamente
3. **RAG Layer** - Busca conhecimento relevante na base
4. **Memory Layer** - Recupera memórias relevantes do cliente
5. **IA** - Gera resposta usando contexto RAG + Memory
6. **Salva**:
   - Log da resposta
   - Cache da resposta (para próximas vezes)
   - Memórias extraídas da conversa

## 🎯 Serviços Disponíveis

### RAGService

```typescript
// Buscar conhecimento relevante
const chunks = await ragService.searchRelevantKnowledge(
  companyId,
  'Qual é a política de troca?',
  { limit: 5, minSimilarity: 0.7 }
);

// Listar bases de conhecimento
const bases = await ragService.listKnowledgeBases(companyId, {
  category: 'POLICY',
  isActive: true
});
```

### SemanticCacheService

```typescript
// Buscar cache
const cached = await cacheService.findCachedResponse(
  companyId,
  'Qual é a política de troca?',
  { minSimilarity: 0.85 }
);

// Salvar cache
await cacheService.saveCache({
  companyId,
  query: 'Qual é a política?',
  response: 'Nossa política...',
  source: 'RAG',
  confidence: 0.9
});

// Limpar caches expirados
await cacheService.cleanExpiredCaches(companyId);

// Estatísticas
const stats = await cacheService.getCacheStats(companyId);
```

### MemoryService

```typescript
// Buscar memórias relevantes
const memories = await memoryService.findRelevantMemories(
  companyId,
  'Qual é a política?',
  {
    conversationId: 'conv-uuid',
    memoryTypes: ['PREFERENCE', 'FACT'],
    limit: 5
  }
);

// Salvar memória
await memoryService.saveMemory({
  companyId,
  conversationId: 'conv-uuid',
  key: 'preference',
  value: 'Prefere contato por email',
  memoryType: 'PREFERENCE',
  confidence: 0.9
});

// Extrair memórias de conversa
await memoryService.extractMemoriesFromConversation(
  companyId,
  conversationId,
  messages
);
```

### LogService

```typescript
// Registrar mensagem
await logService.logMessage({
  companyId,
  conversationId,
  from: 'CLIENT',
  content: 'Mensagem do cliente',
  source: 'WHATSAPP',
  metadata: {
    processingTime: 150,
    aiModel: 'gpt-4',
    aiTokens: 100,
    aiCost: 0.01
  }
});

// Buscar mensagens por similaridade
const messages = await logService.searchMessagesBySimilarity(
  companyId,
  'buscar mensagens sobre política',
  { limit: 10, minSimilarity: 0.7 }
);

// Estatísticas
const stats = await logService.getLogStats(companyId, {
  dateRange: { start: new Date('2024-01-01'), end: new Date() }
});
```

## 🔄 Migração de Dados Existentes

Se você já tinha embeddings em formato JSON e quer migrar para `vector`:

```bash
# Execute o script de migração
psql -U postgres -d chatbot_db -f prisma/migrate-json-to-vector.sql
```

**⚠️ IMPORTANTE:** Faça backup antes de executar!

## 📊 Performance

### Índices HNSW

Os índices HNSW melhoram significativamente a velocidade de buscas vetoriais:

- **Sem índice:** Busca sequencial (lento para muitos registros)
- **Com índice HNSW:** Busca otimizada (rápido mesmo com milhões de registros)

### Parâmetros dos Índices

- `m = 16`: Número de conexões (maior = mais preciso, mais lento)
- `ef_construction = 64`: Tamanho da lista durante construção

**Recomendações:**
- **Muitas buscas, poucas inserções:** `m = 32, ef_construction = 128`
- **Muitas inserções, poucas buscas:** `m = 8, ef_construction = 32`
- **Equilibrado (padrão):** `m = 16, ef_construction = 64`

## 🧪 Testando sem OpenAI

O sistema funciona perfeitamente sem OpenAI usando embeddings simulados:

```typescript
// Sem OPENAI_API_KEY configurada, o EmbeddingService
// automaticamente usa embeddings simulados
const embeddingService = new EmbeddingService();
const embedding = await embeddingService.generateEmbedding('teste');
// Retorna array de 1536 números (simulado)
```

**Nota:** Embeddings simulados são consistentes (mesmo texto = mesmo embedding), mas não têm significado semântico real. Use apenas para desenvolvimento/testes.

## 🚀 Próximos Passos

1. **Configurar OpenAI** (quando disponível):
   ```env
   OPENAI_API_KEY=sk-...
   ```

2. **Criar bases de conhecimento** para sua empresa

3. **Monitorar cache hit rate** para otimizar

4. **Ajustar thresholds** de similaridade conforme necessário:
   - Cache: 0.85 (padrão)
   - RAG: 0.7 (padrão)
   - Memory: 0.75 (padrão)

## 📝 Notas Importantes

- O schema Prisma usa `Json?` para embeddings (Prisma não suporta `vector` nativamente)
- As queries SQL usam `vector(1536)` diretamente (via `$queryRaw`)
- Embeddings simulados funcionam, mas não têm significado semântico real
- Índices HNSW são opcionais mas altamente recomendados para produção

## 🐛 Troubleshooting

### Erro: "operator does not exist: vector"

**Solução:** Execute `CREATE EXTENSION IF NOT EXISTS vector;` no banco.

### Buscas muito lentas

**Solução:** Crie os índices HNSW (veja seção "Criar Índices HNSW").

### Embeddings não funcionam

**Solução:** Verifique se o pgvector está instalado e se os índices foram criados.


