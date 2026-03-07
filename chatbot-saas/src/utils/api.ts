/**
 * Extrai a mensagem de erro/sucesso do retorno da API (data ou errors, conforme o api-provider).
 * Útil para exibir no toast a mensagem que o backend envia em respostas de erro (ex.: 400, 401).
 */
export function getBackendMessage(
  response: { data?: { message?: string }; errors?: unknown },
  fallback: string
): string {
  const fromData = response.data?.message;
  if (fromData && typeof fromData === 'string') return fromData;
  const err = response.errors;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  if (typeof err === 'string') return err;
  return fallback;
}

/** Mensagens padrão por status HTTP quando o backend não envia message. */
const DEFAULT_MESSAGES: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação',
  404: 'Recurso não encontrado',
  408: 'Tempo esgotado. Tente novamente.',
  409: 'Conflito com o estado atual',
  422: 'Dados inválidos',
  500: 'Erro interno do servidor. Tente mais tarde.',
  502: 'Servidor temporariamente indisponível',
  503: 'Serviço indisponível. Tente em instantes.',
  504: 'Tempo esgotado no servidor'
};

/**
 * Retorna mensagem de erro para exibir ao usuário: prioriza a message do backend, depois fallback por status.
 */
export function getApiErrorMessage(
  status: number,
  errors: unknown,
  fallback?: string
): string {
  if (errors && typeof errors === 'object' && 'message' in errors && typeof (errors as { message: unknown }).message === 'string') {
    return (errors as { message: string }).message;
  }
  if (typeof errors === 'string') return errors;
  return DEFAULT_MESSAGES[status] ?? fallback ?? 'Ocorreu um erro. Tente novamente.';
}

/** Mensagens que indicam falha de login (credenciais), não token expirado. */
const LOGIN_FAILURE_MESSAGES = [
  'credenciais inválidas',
  'credenciales inválidas',
  'invalid credentials',
  'email ou senha',
  'usuário não encontrado',
  'senha incorreta'
];

/**
 * Quando o back retorna 401 com "Credenciais inválidas", não devemos acionar refresh/sessão expirada.
 * Retorna true se for esse caso (apenas devolver o erro para o login exibir o toast).
 */
export function isLoginFailure401(status: number, body: unknown): boolean {
  if (status !== 401) return false;
  const message = typeof body === 'object' && body !== null && 'message' in body
    ? String((body as { message: unknown }).message ?? '').toLowerCase()
    : '';
  return LOGIN_FAILURE_MESSAGES.some((m) => message.includes(m));
}
