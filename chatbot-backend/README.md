# Botatende Backend API

Backend API para o SaaS **Botatende** - Chatbot automatizado para WhatsApp com IA.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📁 Estrutura do Projeto

```
src/
├─ prisma/
│ └─ schema.prisma          # Schema do banco de dados
├─ modules/
│ ├─ auth/                  # Autenticação
│ ├─ company/               # Gestão de empresas
│ ├─ chatbot/               # Lógica do chatbot
│ ├─ message/               # Mensagens
│ └─ analytics/             # Analytics e relatórios
├─ middlewares/
│ ├─ authMiddleware.ts      # Middleware de autenticação
│ └─ errorHandler.ts        # Tratamento de erros
├─ utils/
│ ├─ jwt.ts                 # Utilitários JWT
│ ├─ response.ts            # Padronização de respostas
│ └─ trainAI.ts             # Simulação de IA
├─ routes/
│ └─ index.ts               # Rotas principais
├─ app.ts                   # Configuração do Express
└─ server.ts                # Servidor
```

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

3. **Configurar banco de dados:**
```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:push
```

4. **Executar em desenvolvimento:**
```bash
npm run dev
```

## 📚 Endpoints da API

### 🔐 Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Login
- `POST /refresh-token` - Renovar token
- `GET /profile` - Perfil do usuário (protegido)

### 🏢 Empresa (`/api/company`)
- `GET /` - Obter empresa do usuário
- `POST /` - Criar/atualizar empresa
- `GET /:companyId/products` - Listar produtos
- `POST /:companyId/products` - Criar produto
- `PUT /products/:productId` - Atualizar produto
- `DELETE /products/:productId` - Deletar produto
- `GET /:companyId/stats` - Estatísticas da empresa

### 🤖 Chatbot (`/api/chatbot`)
- `POST /:companyId/message` - Processar mensagem
- `POST /:companyId/train` - Treinar IA
- `GET /:companyId/training-history` - Histórico de treinamento
- `GET /:companyId/chat-history` - Histórico de conversas
- `GET /:companyId/stats` - Estatísticas do chat

### 💬 Mensagens (`/api/messages`)
- `POST /:companyId` - Criar mensagem
- `GET /:companyId` - Listar mensagens
- `GET /message/:messageId` - Obter mensagem específica
- `DELETE /message/:messageId` - Deletar mensagem
- `GET /:companyId/stats` - Estatísticas das mensagens
- `GET /:companyId/recent` - Mensagens recentes

### 📊 Analytics (`/api/analytics`)
- `GET /:companyId/overview` - Visão geral
- `GET /:companyId/messages-by-range` - Mensagens por período
- `GET /:companyId/hourly-distribution` - Distribuição horária
- `GET /:companyId/top-keywords` - Palavras-chave mais mencionadas
- `GET /:companyId/dashboard` - Dados completos do dashboard

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar mudanças no schema
npm run db:migrate     # Criar migração
npm run db:studio      # Abrir Prisma Studio
```

## 🔐 Autenticação

Todas as rotas (exceto `/auth/*`) requerem o header:
```
Authorization: Bearer <access_token>
```

## 📝 Exemplos de Uso

### Registrar usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@empresa.com",
    "password": "123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@empresa.com",
    "password": "123456"
  }'
```

### Criar empresa
```bash
curl -X POST http://localhost:3001/api/company \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Minha Empresa",
    "description": "Descrição da empresa",
    "whatsappNumber": "+5511999999999"
  }'
```

### Processar mensagem do chatbot
```bash
curl -X POST http://localhost:3001/api/chatbot/COMPANY_ID/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "message": "Olá, gostaria de saber sobre seus produtos"
  }'
```

## 🚀 Deploy

1. **Build do projeto:**
```bash
npm run build
```

2. **Configurar variáveis de ambiente de produção**

3. **Executar:**
```bash
npm start
```

## 📄 Licença

ISC License
