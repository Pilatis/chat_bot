# 🔑 Configuração da OpenAI - Guia Rápido

## ✅ Status Atual

**O código já está 100% pronto para usar OpenAI!** 

Você não precisa mexer em nenhum arquivo de código. Basta configurar a chave da API e tudo funcionará automaticamente.

## 🚀 Como Configurar (3 Passos Simples)

### 1. Obter Chave da OpenAI

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Clique em "Create new secret key"
4. Copie a chave (ela começa com `sk-...`)

### 2. Adicionar no Arquivo `.env`

No arquivo `.env` do seu projeto `chatbot-backend`, adicione:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
```

**Exemplo:**
```env
DATABASE_URL=postgresql://postgres:postgreadmin@localhost:5432/chatbot_db
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

### 3. Reiniciar o Servidor

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

## ✨ Pronto! Está Funcionando

Agora o sistema vai:

- ✅ **Gerar embeddings reais** usando `text-embedding-3-small` (padrão)
- ✅ **Buscar conhecimento** usando busca vetorial real
- ✅ **Cache semântico** funcionando com embeddings reais
- ✅ **Memórias** com significado semântico real
- ✅ **Tudo automático** - nenhuma mudança de código necessária

## 🔧 Configurações Opcionais

Se quiser personalizar, você pode adicionar no `.env`:

```env
# Modelo de embedding (padrão: text-embedding-3-small)
EMBEDDING_MODEL=text-embedding-3-small

# Ou use o modelo mais antigo (mais barato):
# EMBEDDING_MODEL=text-embedding-ada-002

# URL base (padrão: https://api.openai.com/v1)
# Só mude se estiver usando proxy ou API alternativa
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📊 Modelos Disponíveis

### text-embedding-3-small (Recomendado - Padrão)
- **Dimensões:** 1536
- **Custo:** $0.02 por 1M tokens
- **Performance:** Excelente
- **Uso:** Recomendado para a maioria dos casos

### text-embedding-ada-002 (Alternativa)
- **Dimensões:** 1536
- **Custo:** $0.10 por 1M tokens
- **Performance:** Boa
- **Uso:** Modelo mais antigo, ainda funcional

### text-embedding-3-large (Para casos avançados)
- **Dimensões:** 3072 (precisa ajustar no schema)
- **Custo:** $0.13 por 1M tokens
- **Performance:** Melhor
- **Uso:** Apenas se precisar de mais precisão

## 🧪 Como Testar se Está Funcionando

### 1. Verificar Logs do Servidor

Quando você processar uma mensagem, você **NÃO** deve ver este aviso:

```
⚠️  OPENAI_API_KEY não configurada. Usando embedding simulado
```

Se não aparecer esse aviso, está funcionando! ✅

### 2. Testar Geração de Embedding

Você pode testar diretamente no código:

```typescript
import { EmbeddingService } from './services/embedding.service';

const embeddingService = new EmbeddingService();
const embedding = await embeddingService.generateEmbedding('teste');

console.log('Embedding gerado:', embedding.length, 'dimensões');
// Deve mostrar: Embedding gerado: 1536 dimensões
```

### 3. Verificar no Banco de Dados

Após processar algumas mensagens, verifique no banco:

```sql
-- Verificar se embeddings foram salvos
SELECT 
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_com_embedding
FROM knowledge_chunks;

-- Verificar se são vetores reais (não simulados)
SELECT 
  id,
  content,
  embedding IS NOT NULL as tem_embedding
FROM knowledge_chunks
LIMIT 5;
```

## 💰 Custos Estimados

### Embeddings
- **text-embedding-3-small:** $0.02 por 1M tokens
- **1 mensagem média:** ~100 tokens = $0.000002
- **1.000 mensagens:** ~$0.002
- **100.000 mensagens:** ~$0.20

### Exemplo Real
Se você processar:
- 1.000 mensagens/dia
- 30 dias = 30.000 mensagens
- Custo: ~$0.06/mês em embeddings

**Muito barato!** 🎉

## 🔄 Fallback Automático

O sistema tem **fallback inteligente**:

1. **Com API Key:** Usa OpenAI (embeddings reais)
2. **Sem API Key:** Usa embeddings simulados (desenvolvimento)
3. **Erro na API:** Tenta fallback para simulado (apenas em desenvolvimento)

## ⚠️ Importante

### Segurança da Chave

- ✅ **NUNCA** commite a chave no Git
- ✅ Adicione `.env` no `.gitignore`
- ✅ Use variáveis de ambiente em produção
- ✅ Rotacione a chave periodicamente

### Limites da API

A OpenAI tem limites de rate:
- **Free tier:** 3 RPM (requests per minute)
- **Tier 1:** 500 RPM
- **Tier 2:** 3.500 RPM

Se precisar de mais, considere:
- Usar cache semântico (reduz chamadas)
- Implementar rate limiting
- Usar batch de embeddings

## 🐛 Troubleshooting

### Erro: "Invalid API Key"

**Solução:**
1. Verifique se copiou a chave completa (começa com `sk-`)
2. Verifique se não há espaços antes/depois
3. Verifique se reiniciou o servidor após adicionar no `.env`

### Erro: "Rate limit exceeded"

**Solução:**
1. Aguarde alguns minutos
2. Implemente cache semântico (já está implementado!)
3. Use batch de embeddings quando possível

### Embeddings ainda são simulados

**Solução:**
1. Verifique se a variável está no `.env` correto
2. Verifique se reiniciou o servidor
3. Verifique se não há erros de conexão nos logs

## 📝 Checklist de Configuração

- [ ] Chave OpenAI obtida
- [ ] Chave adicionada no `.env`
- [ ] Servidor reiniciado
- [ ] Teste realizado
- [ ] Logs verificados (sem aviso de simulação)
- [ ] Embeddings sendo gerados corretamente

## 🎯 Próximos Passos Após Configurar

1. **Criar bases de conhecimento:**
   ```typescript
   const ragService = new RAGService();
   await ragService.createKnowledgeBase({...});
   ```

2. **Processar mensagens:**
   - O sistema já usa OpenAI automaticamente
   - Cache semântico reduz custos
   - Memórias são aprendidas automaticamente

3. **Monitorar custos:**
   - Acompanhe no dashboard da OpenAI
   - Use cache para reduzir chamadas
   - Ajuste thresholds de similaridade se necessário

## ✅ Resumo

**SIM, você pode simplesmente:**
1. Pegar a chave da OpenAI
2. Adicionar no `.env`
3. Reiniciar o servidor
4. **Pronto!** Tudo funciona automaticamente

**Nenhuma mudança de código necessária!** 🎉

O sistema foi projetado para funcionar com ou sem OpenAI, então a integração já está completa.


