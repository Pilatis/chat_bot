# Diagrama da Arquitetura

## Estrutura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                        │
│              (ChatbotService, Controllers)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      LOG LAYER                               │
│  ┌──────────────┐         ┌──────────────────┐            │
│  │ MessageLog   │─────────▶│ MessageEmbedding │            │
│  │ - content    │         │ - embedding       │            │
│  │ - metadata   │         │ - model           │            │
│  │ - aiCost     │         └──────────────────┘            │
│  │ - source     │                                          │
│  └──────────────┘                                          │
│         │                                                   │
│         └──────────────┐                                   │
│                        ▼                                   │
│              ┌──────────────┐                              │
│              │ Conversation │                              │
│              │ - sessionId  │                              │
│              │ - status     │                              │
│              └──────────────┘                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    MEMORY LAYER                                │
│  ┌──────────────────────┐                                    │
│  │ ConversationMemory   │                                    │
│  │ - memoryType         │                                    │
│  │ - key/value          │                                    │
│  │ - confidence          │                                    │
│  │ - source              │                                    │
│  └──────────────────────┘                                    │
│         │                                                    │
│         └──▶ Aprende de conversas                            │
│              - Preferências                                  │
│              - Contexto                                      │
│              - Fatos                                         │
│              - Padrões                                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CACHE LAYER                                │
│  ┌──────────────────────┐                                    │
│  │ SemanticCache        │                                    │
│  │ - queryEmbedding     │                                    │
│  │ - response           │                                    │
│  │ - source (RAG/MEM/AI)│                                    │
│  │ - hitCount           │                                    │
│  │ - expiresAt          │                                    │
│  └──────────────────────┘                                    │
│         │                                                    │
│         └──▶ Evita chamadas à IA                            │
│              - Busca por similaridade                        │
│              - Threshold: 0.85                              │
│              - Expiração automática                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      RAG LAYER                                │
│  ┌──────────────┐         ┌──────────────────┐            │
│  │KnowledgeBase │────────▶│ KnowledgeChunk   │            │
│  │ - title      │         │ - content         │            │
│  │ - category   │         │ - embedding       │            │
│  │ - content    │         │ - chunkIndex      │            │
│  │ - priority   │         │ - tokenCount       │            │
│  └──────────────┘         └──────────────────┘            │
│         │                                                    │
│         └──▶ Conhecimento Oficial                          │
│              - Produtos                                     │
│              - Serviços                                     │
│              - Políticas                                    │
│              - FAQ                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICE                                 │
│              (OpenAI, Anthropic, etc)                        │
└─────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │ 1. Envia mensagem
       ▼
┌─────────────────┐
│  MessageLog     │ ← Log bruto
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ SemanticCache   │ ← Verifica cache
└──────┬──────────┘
       │
       ├─ Cache HIT? ──▶ Retorna resposta
       │
       └─ Cache MISS? ──▶ Continua
                          │
                          ▼
                   ┌──────────────┐
                   │ KnowledgeBase│ ← Busca conhecimento
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │Conversation  │ ← Busca memórias
                   │Memory        │
                   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │     AI       │ ← Gera resposta
                   └──────┬───────┘
                          │
                          ▼
              ┌───────────────────────┐
              │ Salva em todas camadas│
              │ - MessageLog          │
              │ - SemanticCache       │
              │ - ConversationMemory  │
              └───────────────────────┘
```

## Relacionamentos entre Models

```
Company
├── KnowledgeBase (1:N)
│   └── KnowledgeChunk (1:N)
│
├── SemanticCache (1:N)
│
├── Conversation (1:N)
│   ├── MessageLog (1:N)
│   └── ConversationMemory (1:N)
│
└── MessageLog (1:N)
    └── MessageEmbedding (1:1)
```

## Estratégia de Cache

```
Nova Pergunta
    │
    ▼
┌─────────────────┐
│ Gera Embedding  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Busca Similar   │
│ no Cache        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
Similaridade  Similaridade
> 0.85       ≤ 0.85
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│Retorna │ │Chama IA  │
│Cache   │ │          │
└────────┘ └────┬─────┘
                │
                ▼
         ┌──────────────┐
         │ Salva no     │
         │ Cache        │
         └──────────────┘
```

