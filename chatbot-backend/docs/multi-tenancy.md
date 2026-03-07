# Multi-Tenancy — Documentação

## Visão Geral

O backend utiliza uma arquitetura **multi-tenant com banco de dados compartilhado e isolamento por linha** (row-level isolation). O **tenant** é a entidade `Company`, e todos os dados de negócio estão vinculados a um `companyId`.

---

## Modelo de Dados

### Hierarquia

```
User (dono)
  └── Company (tenant)
        ├── Assistant
        ├── Product
        ├── Service
        ├── Message
        ├── Analytics
        ├── KnowledgeBase → KnowledgeChunk
        ├── Conversation → ConversationCache
        ├── MessageLog
        ├── Subscription
        └── TrainingData
```

### Regras

- Um `User` pode ter **várias** `Companies`
- Cada entidade de negócio possui `companyId` como chave estrangeira
- Índices compostos com `companyId` garantem performance nas queries por tenant

---

## Middleware de Tenant (`companyMiddleware`)

### Arquivo: `src/middlewares/companyMiddleware.ts`

Middleware centralizado que:

1. Extrai `companyId` de `req.params.companyId`
2. Verifica que a empresa existe e pertence ao `req.user.userId` (definido pelo `authMiddleware`)
3. Popula `req.company` com `{ id, ownerId, name }`
4. Retorna `403` se a empresa não pertencer ao usuário

### Tipo exportado

```typescript
interface TenantRequest extends AuthenticatedRequest {
  company?: { id: string; ownerId: string; name: string };
}
```

### Uso nas rotas

```typescript
import { companyMiddleware } from '../../middlewares/companyMiddleware';

router.get('/:companyId/products', companyMiddleware, controller.getProducts);
```

O middleware é aplicado individualmente em cada rota que opera sobre um tenant, **após** o `authMiddleware` (que roda via `router.use(authMiddleware)` no início de cada módulo).

---

## Padrão de Rotas

### Antes (inconsistente)

```
PUT  /products/:productId          — sem companyId na URL
DELETE /products/:productId         — sem companyId na URL
PUT  /assistant/:assistantId        — sem companyId na URL
DELETE /assistant/:assistantId      — sem companyId na URL
GET  /message/:messageId            — sem companyId na URL
DELETE /message/:messageId          — sem companyId na URL
```

### Depois (padronizado)

Todas as rotas que operam dentro de um tenant agora incluem `/:companyId/` na URL:

| Módulo | Rota | Método |
|--------|------|--------|
| **Company** | `/company` | `GET` — lista empresas do usuário |
| | `/company` | `POST` — cria empresa |
| | `/company/:companyId` | `GET` — detalhes da empresa |
| | `/company/:companyId` | `PUT` — atualiza empresa |
| | `/company/:companyId/products` | `GET / POST` |
| | `/company/:companyId/products/:productId` | `PUT / DELETE` |
| | `/company/:companyId/services` | `GET / POST` |
| | `/company/:companyId/services/:serviceId` | `PUT / DELETE` |
| | `/company/:companyId/stats` | `GET` |
| **Assistant** | `/company/:companyId/assistants` | `GET / POST` |
| | `/company/:companyId/assistants/:assistantId` | `PUT / DELETE` |
| **Chatbot** | `/chatbot/:companyId/message` | `POST` |
| | `/chatbot/:companyId/train` | `POST` |
| | `/chatbot/:companyId/training-history` | `GET` |
| | `/chatbot/:companyId/chat-history` | `GET` |
| | `/chatbot/:companyId/stats` | `GET` |
| **Messages** | `/messages/:companyId` | `GET / POST` |
| | `/messages/:companyId/stats` | `GET` |
| | `/messages/:companyId/recent` | `GET` |
| | `/messages/:companyId/message/:messageId` | `GET / DELETE` |
| **Analytics** | `/analytics/:companyId/overview` | `GET` |
| | `/analytics/:companyId/messages-by-range` | `GET` |
| | `/analytics/:companyId/hourly-distribution` | `GET` |
| | `/analytics/:companyId/top-keywords` | `GET` |
| | `/analytics/:companyId/dashboard` | `GET` |
| **WhatsApp** | `/whatsapp/:companyId/session` | `POST` — criar sessão |
| | `/whatsapp/:companyId/session/:sessionName/qrcode` | `GET` |
| | `/whatsapp/:companyId/session/:sessionName/status` | `GET` |
| | `/whatsapp/:companyId/session/:sessionName` | `DELETE` |
| | `/whatsapp/:companyId/sessions` | `GET` — listar sessões da empresa |
| | `/whatsapp/:companyId/send-message` | `POST` |

---

## API de Company — Múltiplas Empresas

### Antes

- `GET /company` — retornava a **primeira** empresa do usuário (`findFirst`)
- `POST /company` — criava ou **atualizava** a primeira empresa (lógica de upsert)

### Depois

- `GET /company` — **lista todas** as empresas do usuário (`findMany`)
- `POST /company` — **cria** uma nova empresa (sempre)
- `GET /company/:companyId` — detalhes de uma empresa específica
- `PUT /company/:companyId` — atualiza uma empresa específica

Isso reflete corretamente o schema Prisma que já permitia `User` 1:N `Company`.

---

## WhatsApp — Isolamento de Sessões

### Antes (vulnerável)

- `createSession` recebia `companyId` no body, mas **não validava** se pertencia ao usuário
- `getQRCode`, `getSessionStatus`, `disconnectSession` usavam apenas `sessionName` — **qualquer** usuário autenticado podia acessar sessões de outros tenants
- `getAllSessions` retornava **todas** as sessões do sistema
- `sendMessage` não validava ownership da sessão

### Depois (seguro)

- Todas as rotas agora possuem `/:companyId/` na URL e passam pelo `companyMiddleware`
- O service mantém um `sessionCompanyMap` que registra qual `companyId` criou cada sessão
- Método `isSessionOwnedByCompany(sessionName, companyId)` valida ownership antes de cada operação
- `getSessionsByCompany(companyId)` retorna apenas sessões do tenant correto
- `disconnectSession` limpa o mapeamento ao desconectar

### Lógica de ownership

```typescript
isSessionOwnedByCompany(sessionName, companyId):
  1. Verifica mapa explícito (sessionCompanyMap)
  2. Fallback: convenção de nome (company_<companyId>)
```

---

## Fluxo de Autenticação e Autorização

```
Request → authMiddleware → companyMiddleware → Controller → Service
                ↓                  ↓
          req.user.userId    req.company.id
          (JWT decode)       (DB lookup + ownership)
```

1. **`authMiddleware`**: Valida JWT, popula `req.user` com `{ userId, email, role }`
2. **`companyMiddleware`**: Valida que `companyId` da URL pertence ao `userId`, popula `req.company`
3. **Controller**: Usa `req.company!.id` diretamente — sem necessidade de validação manual
4. **Service**: Recebe `companyId` já validado — sem queries extras de ownership

### Redução de queries

Antes, **cada método** de cada service fazia:
```sql
SELECT * FROM companies WHERE id = :companyId AND ownerId = :userId
```

Agora essa query é feita **uma vez** no middleware, e os services operam diretamente com o `companyId` confiável.

---

## Resumo das Mudanças

| O que mudou | Arquivos |
|-------------|----------|
| Middleware de tenant centralizado | `src/middlewares/companyMiddleware.ts` (novo) |
| Company: suporte multi-empresa | `company.routes.ts`, `company.controller.ts`, `company.service.ts` |
| Assistant: rotas padronizadas | `assistant.routes.ts`, `assistant.controller.ts`, `assistant.service.ts` |
| Message: rotas padronizadas | `message.routes.ts`, `message.controller.ts`, `message.service.ts` |
| Analytics: usa middleware | `analytics.routes.ts`, `analytics.controller.ts` |
| Chatbot: usa middleware | `chatbot.routes.ts`, `chatbot.controller.ts` |
| WhatsApp: isolamento completo | `whatsapp.routes.ts`, `whatsapp.controller.ts`, `whatsapp.service.ts` |
| Registro de rotas | `src/routes/index.ts` |
