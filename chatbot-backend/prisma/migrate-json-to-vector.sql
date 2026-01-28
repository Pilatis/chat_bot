-- Script de migração: Converter embeddings de JSON para vector(1536)
-- Execute este script APENAS se você já tinha dados em formato JSON
-- e quer migrá-los para o tipo vector nativo do pgvector

-- IMPORTANTE: Faça backup do banco antes de executar!

-- 1. Verificar se a extensão pgvector está instalada
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Adicionar coluna temporária para conversão
-- (Se a coluna embedding já for vector, pule esta etapa)

-- 3. Converter embeddings de KnowledgeChunk
-- Se você tinha embeddings em JSON, descomente e ajuste:
/*
UPDATE knowledge_chunks
SET embedding = embedding::text::vector(1536)
WHERE embedding IS NOT NULL
  AND embedding::text != 'null'
  AND embedding::text != '[]';
*/

-- 4. Converter embeddings de ConversationCache
/*
UPDATE conversation_caches
SET "queryEmbedding" = "queryEmbedding"::text::vector(1536)
WHERE "queryEmbedding" IS NOT NULL
  AND "queryEmbedding"::text != 'null'
  AND "queryEmbedding"::text != '[]';
*/

-- 5. Verificar conversão
SELECT 
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embedding
FROM knowledge_chunks;

SELECT 
  COUNT(*) as total_caches,
  COUNT("queryEmbedding") as caches_with_embedding
FROM conversation_caches;

-- 6. Criar índices HNSW para melhor performance (opcional mas recomendado)
-- Estes índices melhoram significativamente a velocidade de buscas vetoriais

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

-- Nota sobre índices HNSW:
-- - m = 16: Número de conexões bidirecionais (padrão recomendado)
-- - ef_construction = 64: Tamanho da lista dinâmica durante construção
-- - vector_cosine_ops: Operador para distância de cosseno (<=>)



