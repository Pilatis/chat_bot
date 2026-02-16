# 📚 Guia Completo de Migrações do Banco de Dados

Este guia explica como aplicar mudanças do schema Prisma ao banco de dados PostgreSQL.

## 🎯 Quando Usar Cada Comando

### `db:push` - Desenvolvimento (Rápido)
- ✅ Use durante desenvolvimento
- ✅ Aplica mudanças diretamente sem criar arquivos de migração
- ✅ Mais rápido e simples
- ⚠️ Não cria histórico de migrações
- ⚠️ Não use em produção

### `db:migrate` - Produção (Recomendado)
- ✅ Use em produção ou quando precisar de histórico
- ✅ Cria arquivos de migração versionados
- ✅ Permite rollback
- ✅ Melhor para trabalho em equipe
- ⚠️ Mais lento (cria arquivos)

---

## 📋 Passo a Passo Completo

### **PASSO 1: Verificar Mudanças no Schema**

Antes de aplicar, revise o que mudou:
```bash
cd chatbot-backend
# Abra o arquivo prisma/schema.prisma e verifique as alterações
```

### **PASSO 2: Garantir que o Banco está Rodando**

Se usar Docker:
```bash
docker-compose up -d
```

Verifique a conexão:
```bash
# Verifique se a variável DATABASE_URL está configurada no .env
```

### **PASSO 3: Escolher o Método de Migração**

#### **Opção A: db:push (Desenvolvimento) - RECOMENDADO PARA AGORA**

```bash
# 1. Aplicar mudanças ao banco
npm run db:push

# 2. Gerar cliente Prisma atualizado
npm run db:generate
```

**O que acontece:**
- ✅ Prisma compara o schema com o banco
- ✅ Aplica as mudanças automaticamente
- ✅ Cria/atualiza tabelas, colunas, índices
- ✅ Atualiza tipos TypeScript

#### **Opção B: db:migrate (Produção)**

```bash
# 1. Criar migração com nome descritivo
npm run db:migrate -- --name add_vector_support

# 2. Gerar cliente Prisma
npm run db:generate
```

**O que acontece:**
- ✅ Cria arquivo de migração em `prisma/migrations/`
- ✅ Aplica a migração ao banco
- ✅ Registra no histórico do Prisma

### **PASSO 4: Verificar se Funcionou**

```bash
# Abrir Prisma Studio para visualizar o banco
npm run db:studio
```

Ou verifique diretamente no banco:
```sql
-- Verificar se as colunas vector foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'knowledge_chunks' 
AND column_name = 'embedding';

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversation_caches' 
AND column_name = 'queryEmbedding';
```

### **PASSO 5: (Opcional) Criar Índices HNSW**

Para melhorar performance de buscas vetoriais:

```sql
-- Conectar ao banco e executar:
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx 
ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS conversation_caches_query_embedding_idx 
ON conversation_caches 
USING hnsw ("queryEmbedding" vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

---

## 🔄 Fluxo Completo (Resumo)

### **Para Desenvolvimento:**
```bash
# 1. Editar schema.prisma
# 2. Aplicar mudanças
npm run db:push

# 3. Gerar cliente
npm run db:generate

# 4. (Opcional) Verificar
npm run db:studio
```

### **Para Produção:**
```bash
# 1. Editar schema.prisma
# 2. Criar migração
npm run db:migrate -- --name descricao_da_mudanca

# 3. Gerar cliente
npm run db:generate

# 4. (Em produção) Aplicar migração
npm run db:migrate deploy
```

---

## ⚠️ Problemas Comuns e Soluções

### **Erro: "Extension vector does not exist"**
```sql
-- Execute no banco:
CREATE EXTENSION IF NOT EXISTS vector;
```

### **Erro: "Column already exists"**
- O Prisma detecta conflitos automaticamente
- Use `--force-reset` apenas em desenvolvimento (⚠️ APAGA DADOS):
```bash
npm run db:push -- --force-reset
```

### **Erro: "Migration failed"**
1. Verifique a conexão com o banco
2. Verifique se o pgvector está instalado
3. Veja os logs de erro do Prisma

### **Dados Existentes em JSON**
Se você tinha embeddings em formato JSON, precisa migrá-los:
```bash
# Execute o script SQL manualmente
psql -d seu_banco -f prisma/migrate-json-to-vector.sql
```

---

## 📝 Checklist Antes de Cada Migração

- [ ] Backup do banco (se produção)
- [ ] Schema.prisma revisado
- [ ] Banco de dados rodando
- [ ] DATABASE_URL configurada no .env
- [ ] Extensão pgvector instalada (se usar vector)
- [ ] Testar em ambiente de desenvolvimento primeiro

---

## 🚀 Comandos Rápidos

```bash
# Ver status do banco
npx prisma db pull

# Visualizar banco
npm run db:studio

# Resetar banco (⚠️ APAGA TUDO - só desenvolvimento)
npx prisma migrate reset

# Ver histórico de migrações
npx prisma migrate status
```

---

## 📖 Referências

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma db push](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- [pgvector Documentation](https://github.com/pgvector/pgvector)



