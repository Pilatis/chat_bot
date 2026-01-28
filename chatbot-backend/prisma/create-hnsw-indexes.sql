-- Script para criar índices HNSW para busca vetorial otimizada
-- Execute este script após instalar o pgvector e criar as tabelas

-- Verifica se a extensão pgvector está instalada
CREATE EXTENSION IF NOT EXISTS vector;

-- Índice HNSW para KnowledgeChunk (busca de conhecimento RAG)
-- HNSW é mais rápido para buscas, mas ocupa mais espaço
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Índice HNSW para ConversationCache (cache semântico e memórias)
CREATE INDEX IF NOT EXISTS conversation_caches_query_embedding_idx 
ON conversation_caches 
USING hnsw ("queryEmbedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Comentários sobre os parâmetros:
-- m = 16: Número de conexões bidirecionais que cada elemento terá (maior = mais preciso, mas mais lento)
-- ef_construction = 64: Tamanho da lista dinâmica candidata durante construção (maior = mais preciso, mas construção mais lenta)

-- Para ambientes com muitas buscas e poucas inserções, você pode aumentar:
-- m = 32, ef_construction = 128 (mais rápido nas buscas, mais lento nas inserções)

-- Para ambientes com muitas inserções e poucas buscas, você pode diminuir:
-- m = 8, ef_construction = 32 (mais rápido nas inserções, mais lento nas buscas)

-- Verificar índices criados:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('knowledge_chunks', 'conversation_caches');


