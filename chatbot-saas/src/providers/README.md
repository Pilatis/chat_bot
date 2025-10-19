# Providers e Hooks da API

Este diretório contém todos os providers e hooks customizados para integração com a API do backend Botatende.

## 🏗️ Estrutura

```
src/
├─ types/
│ ├─ auth.types.ts            # Tipos para autenticação
│ ├─ company.types.ts         # Tipos para empresa
│ ├─ chatbot.types.ts         # Tipos para chatbot
│ ├─ analytics.types.ts       # Tipos para analytics
│ ├─ api.types.ts            # Tipos para API
│ └─ index.ts                # Exports centralizados
├─ context/
│ ├─ auth-context.tsx         # Context de autenticação
│ ├─ company-context.tsx      # Context de empresa
│ ├─ chatbot-context.tsx     # Context de chatbot
│ ├─ analytics-context.tsx   # Context de analytics
│ └─ index.tsx               # Exports centralizados
├─ providers/
│ ├─ api.provider.tsx         # Provider da API com Axios
│ ├─ auth.provider.tsx        # Provider de autenticação
│ ├─ company.provider.tsx     # Provider de empresa
│ ├─ chatbot.provider.tsx     # Provider de chatbot
│ ├─ analytics.provider.tsx   # Provider de analytics
│ ├─ index.tsx                # Exports centralizados
│ └─ README.md                # Este arquivo
├─ hooks/
│ ├─ use-api.ts              # Hook para API
│ ├─ useAuth.ts              # Hook para autenticação
│ ├─ useCompany.ts           # Hook para empresa
│ ├─ useChatbot.ts           # Hook para chatbot
│ ├─ useAnalytics.ts         # Hook para analytics
│ └─ index.ts                # Exports centralizados
└─ examples/
   ├─ LoginExample.tsx        # Exemplo de uso do login
   ├─ CompanyExample.tsx      # Exemplo de gestão de empresa
   └─ ChatbotExample.tsx      # Exemplo de chatbot
```

## 🚀 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. Configurar Providers

No seu `App.tsx` ou `main.tsx`:

```tsx
import { BaseProvider } from './providers';

function App() {
  return (
    <BaseProvider>
      {/* Sua aplicação */}
    </BaseProvider>
  );
}
```

## 📚 Hooks Disponíveis

### 🔐 Autenticação (`useAuth`)

```tsx
import { useAuth } from './hooks/useAuth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
    } catch (error) {
      console.error('Erro no login:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bem-vindo, {user?.name}!</p>
          <button onClick={logout}>Sair</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Entrar</button>
      )}
    </div>
  );
}
```

### 🏢 Empresa (`useCompany`)

```tsx
import { useCompany, useProducts } from './hooks/useCompany';

function CompanyComponent() {
  const { company, createOrUpdateCompany, isLoading } = useCompany();
  const { products, createProduct, deleteProduct } = useProducts();

  const handleCreateCompany = async () => {
    await createOrUpdateCompany({
      name: 'Minha Empresa',
      description: 'Descrição da empresa'
    });
  };

  return (
    <div>
      {company ? (
        <div>
          <h2>{company.name}</h2>
          <p>Produtos: {company._count.products}</p>
        </div>
      ) : (
        <button onClick={handleCreateCompany}>Criar Empresa</button>
      )}
    </div>
  );
}
```

### 🤖 Chatbot (`useChatbot`)

```tsx
import { useChat } from './hooks/useChatbot';

function ChatComponent({ companyId }: { companyId: string }) {
  const { messages, sendMessage, isProcessing } = useChat(companyId);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>
          <strong>{msg.from}:</strong> {msg.content}
        </div>
      ))}
      {/* Interface de chat */}
    </div>
  );
}
```

### 📊 Analytics (`useAnalytics`)

```tsx
import { useAnalytics, useMetrics } from './hooks/useAnalytics';

function DashboardComponent({ companyId }: { companyId: string }) {
  const { overview, isLoading } = useAnalytics();
  const { metrics } = useMetrics(companyId);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total de mensagens: {metrics.totalMessages}</p>
      <p>Mensagens hoje: {metrics.todayMessages}</p>
    </div>
  );
}
```

## 🔧 API Direta

Para casos mais específicos, você pode usar a API diretamente:

```tsx
import { useApi, useAuthApi, useCompanyApi } from './providers';

function CustomComponent() {
  const { get, post, put, delete: deleteMethod } = useApi();
  const { login, register } = useAuthApi();
  const { getCompany, createProduct } = useCompanyApi();

  const handleCustomRequest = async () => {
    try {
      const response = await get('/custom-endpoint');
      console.log(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return <button onClick={handleCustomRequest}>Fazer Requisição</button>;
}
```

## 🛡️ Recursos de Segurança

### Interceptors Automáticos

- **Token de Autenticação**: Adicionado automaticamente em todas as requisições
- **Renovação de Token**: Automática quando o token expira
- **Logout Automático**: Quando não consegue renovar o token

### Tratamento de Erros

```tsx
const { error, clearError } = useAuth();

if (error) {
  return (
    <div>
      <p>Erro: {error}</p>
      <button onClick={clearError}>Fechar</button>
    </div>
  );
}
```

## 📱 Estados de Loading

Todos os hooks fornecem estados de loading:

```tsx
const { isLoading, isProcessing } = useChatbot();

if (isLoading) {
  return <div>Carregando...</div>;
}

if (isProcessing) {
  return <div>Processando mensagem...</div>;
}
```

## 🔄 Atualização de Dados

```tsx
const { refreshCompany } = useCompany();
const { getChatHistory } = useChatbot();

const handleRefresh = async () => {
  await refreshCompany();
  await getChatHistory();
};
```

## 🎯 Exemplos Completos

Veja os arquivos em `src/examples/` para exemplos completos de implementação:

- `LoginExample.tsx` - Sistema de login
- `CompanyExample.tsx` - Gestão de empresa e produtos
- `ChatbotExample.tsx` - Interface de chat

## 🚨 Tratamento de Erros

Todos os hooks incluem tratamento de erros:

```tsx
const { error, clearError } = useCompany();

useEffect(() => {
  if (error) {
    // Mostrar notificação de erro
    showNotification(error);
  }
}, [error]);
```

## 🔧 Configuração Avançada

### Personalizar Axios

```tsx
// Em api-provider.tsx, você pode modificar a configuração do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Adicionar Novos Endpoints

```tsx
// Em api-provider.tsx, adicione novos hooks
export const useCustomApi = () => {
  const { get, post } = useApi();

  const customEndpoint = async (data: any) => {
    return post('/custom-endpoint', data);
  };

  return { customEndpoint };
};
```
