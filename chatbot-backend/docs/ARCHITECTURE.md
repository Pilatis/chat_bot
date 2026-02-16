# Arquitetura de Mensagens e IA - Chatbot SaaS

## Visão Geral

Esta arquitetura foi projetada para suportar um sistema de chatbot inteligente com múltiplas camadas de processamento, cache semântico e aprendizado contínuo. A estrutura é dividida em 4 camadas principais:

1. **RAG Layer** - Conhecimento Oficial do Negócio
2. **Cache Layer** - Cache Semântico Inteligente
3. **Memory Layer** - Memória Aprendida via Conversas
4. **Log Layer** - Log Bruto Completo

---

## 🧠 RAG Layer - Retrieval Augmented Generation

### Objetivo
Armazenar e recuperar conhecimento oficial da empresa (produtos, serviços, políticas) para fornecer respostas precisas baseadas em dados estruturados.

### Models

#### `KnowledgeBase`
Base de conhecimento oficial da empresa:
- **Categorias**: Produtos, Serviços, Políticas, FAQ, Informações da Empresa
- **Prioridade**: Sistema de priorização para busca (maior = mais relevante)
- **Ativação**: Controle de conhecimento ativo/inativo

#### `KnowledgeChunk`
Chunks de conhecimento com embeddings para busca semântica:
- **Embeddings**: Vetores de 1536 dimensões (OpenAI text-embedding-ada-002)
- **Chunking**: Divisão inteligente de documentos grandes
- **Token Count**: Controle de tamanho dos chunks

### Fluxo de Uso
1. Empresa adiciona conhecimento oficial → `KnowledgeBase`
2. Sistema divide em chunks → `KnowledgeChunk`
3. Gera embeddings para cada chunk
4. Na busca, compara embedding da pergunta com chunks
5. Retorna chunks mais similares para contexto da IA

---

## 💾 Cache Layer - Cache Semântico Inteligente

### Objetivo
Reduzir chamadas à IA armazenando respostas para perguntas similares, economizando custos e melhorando performance.

### Model

#### `SemanticCache`
Cache de respostas baseado em similaridade semântica:
- **Query Embedding**: Embedding da pergunta original
- **Response**: Resposta cacheada
- **Source**: Origem (RAG, MEMORY, AI, HYBRID)
- **Hit Count**: Contador de uso
- **Expiration**: Sistema de expiração automática

### Estratégia de Cache
1. **Busca por Similaridade**: Compara embedding da nova pergunta com cache existente
2. **Threshold**: Se similaridade > 0.85, retorna cache
3. **Atualização**: Incrementa hitCount e atualiza lastHitAt
4. **Expiração**: Remove caches antigos ou pouco usados

### Benefícios
- ⚡ Redução de 60-80% nas chamadas à IA
- 💰 Economia significativa de custos
- 🚀 Respostas instantâneas para perguntas frequentes

---

## 🧩 Memory Layer - Memória Aprendida

### Objetivo
Aprender e reutilizar informações das conversas para personalizar respostas e manter contexto.

### Models

#### `Conversation`
Agrupa mensagens em conversas por sessão/cliente:
- **Client Identification**: Telefone, nome, sessão
- **Status**: Active, Paused, Ended, Archived
- **Metadata**: Canal, dispositivo, contexto

#### `ConversationMemory`
Memória aprendida das conversas:
- **Types**: Preference, Context, Fact, Pattern, Intent
- **Key-Value**: Sistema flexível de armazenamento
- **Confidence**: Nível de confiança na memória
- **Source**: Origem (Conversation, Manual, AI, System)

### Tipos de Memória

1. **PREFERENCE**: Preferências do cliente (ex: "prefere contato por email")
2. **CONTEXT**: Contexto da conversa (ex: "está procurando produto X")
3. **FACT**: Fatos aprendidos (ex: nome, email, telefone)
4. **PATTERN**: Padrões identificados (ex: "sempre pergunta sobre preço")
5. **INTENT**: Intenções identificadas (ex: "quer comprar", "quer suporte")

### Fluxo de Aprendizado
1. Conversa ocorre → `MessageLog` criado
2. IA analisa conversa e extrai informações
3. Memórias são criadas/atualizadas → `ConversationMemory`
4. Próximas conversas usam memórias relevantes

---

## 📊 Log Layer - Log Bruto Completo

### Objetivo
Armazenar todos os dados brutos para análise, auditoria e melhoria contínua.

### Models

#### `MessageLog`
Log completo de todas as mensagens:
- **Metadata Completo**: Canal, dispositivo, IP, user-agent
- **Performance**: Tempo de processamento
- **Custos**: Tokens consumidos, custo da IA
- **Source**: Origem da mensagem (WhatsApp, Web, API, etc)

#### `MessageEmbedding`
Embeddings das mensagens:
- **Embedding**: Vetor da mensagem para análise semântica
- **Model**: Modelo usado para gerar embedding
- **Análise**: Permite análise de similaridade, clustering, etc

### Uso
- 📈 Analytics detalhados
- 🔍 Busca semântica em histórico
- 🎯 Identificação de padrões
- 📊 Relatórios e insights

---

## 🔄 Fluxo Completo de Processamento

```
1. Cliente envia mensagem
   ↓
2. MessageLog criado (Log Layer)
   ↓
3. Verifica SemanticCache (Cache Layer)
   ├─ Cache hit? → Retorna resposta cacheada
   └─ Cache miss? → Continua
   ↓
4. Busca em KnowledgeBase (RAG Layer)
   ├─ Encontra chunks relevantes
   └─ Adiciona ao contexto
   ↓
5. Busca em ConversationMemory (Memory Layer)
   ├─ Recupera memórias relevantes
   └─ Adiciona contexto personalizado
   ↓
6. Gera resposta com IA
   ├─ Usa contexto do RAG
   ├─ Usa memórias do cliente
   └─ Gera resposta personalizada
   ↓
7. Salva resposta
   ├─ MessageLog (resposta)
   ├─ SemanticCache (se relevante)
   └─ ConversationMemory (aprende novo contexto)
   ↓
8. Retorna resposta ao cliente
```

---

## 🗄️ Configuração do Banco de Dados

### PostgreSQL com pgvector (Recomendado)

Para usar embeddings vetoriais nativos, instale a extensão `pgvector`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

O schema usa `Unsupported("vector(1536)")` que será mapeado para o tipo `vector` do pgvector.

### Alternativa: JSONB (Compatível)

Se não puder usar pgvector, você pode modificar o schema para usar JSONB:

```prisma
embedding Json? // Array de números [0.123, 0.456, ...]
```

**Nota**: Busca por similaridade será mais lenta, mas ainda funcional.

---

## 📈 Índices e Performance

### Índices Criados

- `KnowledgeBase`: `[companyId, isActive]`, `[companyId, category]`
- `KnowledgeChunk`: `[companyId, knowledgeBaseId]`, `[knowledgeBaseId, chunkIndex]`
- `SemanticCache`: `[companyId, source]`, `[companyId, expiresAt]`, `[queryText]`
- `Conversation`: `[companyId, status]`, `[companyId, startedAt]`, `[clientPhone]`
- `ConversationMemory`: `[companyId, memoryType, isActive]`, `[companyId, key]`
- `MessageLog`: `[companyId, createdAt]`, `[conversationId, createdAt]`, `[companyId, from]`

### Otimizações Recomendadas

1. **Particionamento**: Considere particionar `MessageLog` por data
2. **Arquivamento**: Mover conversas antigas para tabela de arquivo
3. **Limpeza**: Limpar caches expirados periodicamente
4. **Vacuum**: Executar VACUUM regularmente

---

## 🔐 Segurança e Privacidade

- **Isolamento por Company**: Todos os dados são isolados por `companyId`
- **Cascade Delete**: Dados são removidos quando empresa é deletada
- **Metadata Sensível**: Dados sensíveis devem ser criptografados no campo `metadata`
- **Expiração**: Caches têm expiração automática

---

## 🚀 Próximos Passos

1. **Implementar Serviços**:
   - `RAGService` - Gerenciamento de conhecimento
   - `CacheService` - Gerenciamento de cache semântico
   - `MemoryService` - Gerenciamento de memória
   - `EmbeddingService` - Geração de embeddings

2. **Integração com IA**:
   - OpenAI API para embeddings
   - OpenAI API para geração de respostas
   - Sistema de fallback

3. **Monitoramento**:
   - Métricas de cache hit rate
   - Custos de IA
   - Performance de busca

4. **Melhorias Futuras**:
   - Fine-tuning de modelos
   - Aprendizado contínuo
   - Análise de sentimento
   - Detecção de intenção avançada

