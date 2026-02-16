# Estudo: Migração do Frontend para Next.js

**Objetivo:** Avaliar esforço, custo e riscos de migrar o frontend atual (Vite + React + React Router) para Next.js, mantendo React.

---

## 1. Estado atual do frontend

| Aspecto | Situação atual |
|--------|-----------------|
| **Framework de build** | Vite 5 |
| **React** | 18.x |
| **Roteamento** | react-router-dom v7 (declarativo: `<Routes>`, `<Route>`) |
| **Rotas** | Todas estáticas: `/`, `/login`, `/register`, `/dashboard`, `/company`, `/chatbot`, `/whatsapp`, `/analytics`, `/plans`, `/server-unavailable`, `/messages` (redirect) |
| **Params dinâmicos** | Nenhum (não há rotas tipo `/company/:id`) |
| **Navegação** | `useNavigate()`, `<Link to="...">`, `<Navigate to="..." />` |
| **Ambiente** | `import.meta.env.VITE_API_BASE_URL` |
| **Providers** | Árvore grande: Chakra → ApiProvider → Auth → Plans → WhatsApp → (por rota: Company, Chatbot, Analytics) |
| **Auth/guards** | Componentes `ProtectedRoute` / `PublicRoute` que redirecionam com `<Navigate to="/login" />` |
| **API** | Axios, base URL por env; interceptors (token, refresh, redirect para `/server-unavailable`) |
| **Testes** | Vitest + Storybook (addon Vitest, Playwright para browser) |

---

## 2. O que muda no Next.js (resumo)

- **Roteamento:** baseado em arquivos (App Router: `app/`, ou Pages Router: `pages/`). Não usa react-router.
- **Navegação:** `next/link` (`<Link href="...">`) e `useRouter()` / `usePathname()` de `next/navigation` (App Router).
- **Redirects:** `redirect()` em Server Components ou em `next.config.js`.
- **Env:** variáveis de cliente precisam do prefixo `NEXT_PUBLIC_` (ex.: `NEXT_PUBLIC_API_BASE_URL`).
- **Client vs Server:** no App Router, por padrão os componentes são Server Components. Tudo que usa `useState`, `useEffect`, Context ou browser APIs vira Client Component com `'use client'` no topo do arquivo.
- **Estrutura:** uma pasta `app/` (ou `pages/`) com layouts e rotas por arquivo; não existe um único `AppRoutes.tsx` central.

---

## 3. Nível de esforço (estimativa)

### Baixo impacto
- **Rotas estáticas:** Todas as rotas atuais são caminhos fixos. Mapear para arquivos do Next é direto (ex.: `app/login/page.tsx`, `app/company/page.tsx`).
- **Sem params dinâmicos:** Não há `useParams()` nem rotas `[id]` para migrar.
- **Componentes de UI:** Maioria (Chakra, ícones, formulários) continua igual; só ganham `'use client'` onde usam hooks/context.

### Médio impacto
- **Substituição de React Router:**
  - `useNavigate()` → `useRouter().push()` ou `router.replace()`.
  - `<Link to="...">` → `<Link href="...">` (next/link); em alguns casos `<Link asChild>` com Chakra `<Link>`.
  - `<Navigate to="..." />` → `redirect()` em server component ou `useEffect` + `router.replace()` em client.
  - `useLocation()` → `usePathname()` + `useSearchParams()` (App Router).
- **Guards de rota (Protected/Public):** No Next não há “wrapper de rota” no mesmo sentido. A proteção vira:
  - Layout que lê auth e chama `redirect('/login')` (em server) ou redireciona no client após checar `user`.
  - Ou middleware em `middleware.ts` checando token/cookie e redirecionando.
- **ApiProvider (e outros providers):** Dependem de `useNavigate` e `useLocation`. Trocar para `useRouter()` e `usePathname()`/`useSearchParams()` do Next; mudança localizada em poucos arquivos.

### Maior impacto
- **Estrutura de pastas e providers:**
  - Hoje: um `App.tsx` com `BrowserRouter` → `BaseProvider` → `AppRoutes`; rotas aninhadas decidem qual provider (Company, Chatbot, Analytics) envolve a página.
  - No Next (App Router): providers precisam estar em um layout (ex.: `app/(dashboard)/layout.tsx`) ou em um root layout. Rotas que precisam de `CompanyProvider` + `ChatbotProvider` só para `/chatbot` exigem um layout de grupo (ex.: `app/(company)/chatbot/layout.tsx`) ou wrappers por rota.
- **Testes (Vitest + Storybook):** Configuração atual é para Vite. Com Next, costuma-se manter Vitest para unitários e ajustar Storybook para Next (ou manter Vite só para Storybook). Pode dar trabalho e quebrar temporariamente testes.
- **Variáveis de ambiente:** Renomear `VITE_*` para `NEXT_PUBLIC_*` e ajustar onde são lidas (build e runtime do Next).

---

## 4. Possíveis problemas

### 4.1 Hidratação e “use client”
- Componentes que usam Context (Auth, Company, API, etc.) precisam ser client. Se um layout for Server Component e importar um provider sem `'use client'`, pode dar erro. Solução: garantir `'use client'` em todos os providers e em layouts que os usam (ou criar um `Providers.tsx` client que monta a árvore).

### 4.2 ApiProvider e redirect
- O ApiProvider hoje usa `useNavigate()` e `useLocation()` para redirecionar para `/server-unavailable` em erro de rede. No Next, isso vira `useRouter().push()` e `usePathname()`. Atenção: em Server Components não se usa hooks; o redirect em caso de erro de API continua sendo no client (dentro do provider).

### 4.3 Ordem e aninhamento de providers
- No Next, a ordem dos providers é definida pelos layouts. É fácil acabar com `CompanyProvider` disponível em rotas que não deveriam (ex.: `/plans`). É preciso desenhar bem os layout groups, por exemplo:
  - `(auth)` para login/register (sem Company).
  - `(dashboard)` com Layout + CompanyProvider para company, chatbot, whatsapp, analytics.
  - Rotas como `/plans` e `/dashboard` podem estar em um layout que não tenha CompanyProvider, dependendo da regra de negócio.

### 4.4 Chakra UI + Next.js
- Chakra v3 costuma funcionar com Next.js; pode ser necessário configurar o `ChakraProvider` em um client layout e, se usar theme/registry, seguir a doc do Chakra para Next/App Router para evitar flash de tema.

### 4.5 Build e bundle
- Next gera seu próprio bundle (Webpack/Turbopack). Algumas dependências que funcionam bem com Vite podem precisar de `transpilePackages` ou ajustes. Vale rodar `next build` cedo e ir corrigindo erros de import/export.

### 4.6 Storybook e Vitest
- Storybook com Vite continua possível em monorepo (front em Next, Storybook em Vite). Se quiser “Next no Storybook”, é preciso usar addon/configuration para Next. Vitest pode rodar só nos arquivos que não dependem de Next (hooks, utils, tipos) ou configurar um ambiente Next; ambos dão um pouco de trabalho.

### 4.7 Rotas e redirects globais
- Hoje: `/` → dashboard, `/messages` → whatsapp. No Next isso vira `redirect()` em `app/page.tsx` e `app/messages/page.tsx` (ou `app/messages/route.ts`) ou redirects em `next.config.js`.

---

## 5. Estrutura sugerida no Next.js (App Router)

Exemplo de mapeamento conceitual:

```
app/
  layout.tsx                    # Root: Chakra, Toaster, BaseProvider (Auth, Api, Plans, WhatsApp)
  page.tsx                      # redirect('/dashboard')
  login/
    page.tsx                    # Página de login (pública)
  register/
    page.tsx
  server-unavailable/
    page.tsx
  (dashboard)/                  # Grupo: layout com Layout (sidebar) + ProtectedRoute lógica
    layout.tsx                  # Verifica auth; se não logado, redirect('/login')
    page.tsx                    # Dashboard
    company/
      layout.tsx                # CompanyProvider
      page.tsx
    chatbot/
      layout.tsx                # CompanyProvider + ChatbotProvider(companyId)
      page.tsx
    whatsapp/
      layout.tsx                # CompanyProvider (já tem no dashboard)
      page.tsx
    analytics/
      layout.tsx                # CompanyProvider + AnalyticsProvider(companyId)
      page.tsx
    plans/
      page.tsx
  messages/
    page.tsx                    # redirect('/whatsapp')
```

A lógica de “ProtectedRoute” e “PublicRoute” (redirecionar logado para dashboard, deslogado para login) pode ficar no `(dashboard)/layout.tsx` (client) ou em middleware.

---

## 6. Checklist de migração (resumido)

| Item | Esforço | Notas |
|------|--------|--------|
| Criar projeto Next (App Router) e mover código | Médio | Escolher `src/` ou não; mover componentes, hooks, providers, tipos |
| Trocar `react-router` por Next (Link, useRouter, redirect) | Médio | ~5–8 arquivos (AppRoutes, Sidebar, Login, Register, Navbar, ApiProvider, ServerUnavailable) |
| Ajustar ApiProvider (navigate + location) | Baixo | 1 arquivo |
| Env: VITE_* → NEXT_PUBLIC_* | Baixo | .env e 1 uso no api-provider |
| Marcar client components com 'use client' | Baixo | Providers, páginas, componentes com hooks |
| Reorganizar rotas em app/* e layouts | Médio | Definir layout groups e onde cada provider fica |
| Guards (auth) em layout ou middleware | Médio | Decisão: middleware vs layout client |
| Chakra + Next (theme, SSR) | Baixo | Seguir doc Chakra para Next |
| Storybook / Vitest | Médio–Alto | Manter com Vite ou adaptar ao Next |
| Testes E2E (se houver) | Baixo–Médio | Atualizar base URL e seletores se necessário |

---

## 7. Conclusão e recomendação

- **Custo/benefício:** A migração é **factível e de esforço moderado** porque:
  - Não há rotas dinâmicas nem dependências pesadas de recursos avançados do React Router.
  - O número de pontos que usam navegação é pequeno.
  - A maior parte do código (UI, lógica de negócio, API) permanece em React e pode ser reutilizada.

- **Onde está o custo:** Principalmente na **reorganização da árvore de providers por layouts**, na **substituição consistente de React Router** e no **ajuste de testes (Storybook/Vitest)**. Estimativa grosseira: **1–3 semanas** para um dev que já conheça Next, dependendo de quantos testes e da estabilidade desejada.

- **Riscos principais:**
  1. Quebrar fluxo de auth/redirect (login, 401, server-unavailable).
  2. Providers disponíveis em rotas erradas (ou faltando em alguma rota).
  3. Regressões em testes e em builds (Storybook/Vitest/Next).

- **Recomendação:** Se o objetivo é só “melhor estrutura e rotas com Next”, a migração faz sentido e o risco é controlável. Se o objetivo for usar SSR/SSG ou API Routes do Next no futuro, a migração prepara bem o terreno. Fazer a migração por etapas (por exemplo: primeiro rotas e navegação, depois layouts e providers, por último testes) reduz o risco.

---

*Documento gerado com base na análise do código do projeto chatbot-saas (Vite + React + React Router).*
