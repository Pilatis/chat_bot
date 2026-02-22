import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

/** Define status HTTP conforme a mensagem de erro (evita 401 em "credenciais inválidas" para não acionar refresh no front). */
function authErrorStatus(message: string): number {
  const m = (message || '').toLowerCase();
  if (m.includes('credenciais inválidas') || m.includes('email') || m.includes('senha')) return 400;
  if (m.includes('já está em uso') || m.includes('já existe')) return 400;
  if (m.includes('não encontrado')) return 404;
  return 400;
}

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password, phone }: RegisterData = req.body;

      if (!name?.trim() || !email?.trim() || !password || !phone?.trim()) {
        return errorResponse(res, 'Nome, email, telefone e senha são obrigatórios', 400);
      }

      if (password.length < 6) {
        return errorResponse(res, 'Senha deve ter pelo menos 6 caracteres', 400);
      }

      const result = await this.authService.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim() });
      return successResponse(res, 'Usuário criado com sucesso', result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar';
      const status = authErrorStatus(message);
      return errorResponse(res, message, status);
    }
  };

  /** Login: falha sempre retorna 400 (credenciais/validação). 401 fica só para token expirado (refresh). */
  login = async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginData = req.body;

      if (!email?.trim() || !password) {
        return errorResponse(res, 'Email e senha são obrigatórios', 400);
      }

      const result = await this.authService.login({ email: email.trim(), password });
      return successResponse(res, 'Login realizado com sucesso', result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro no login';
      return errorResponse(res, message, 400);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      const profile = await this.authService.getProfile(userId);
      return successResponse(res, 'Perfil obtido com sucesso', profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao buscar perfil';
      const status = message.toLowerCase().includes('não encontrado') ? 404 : 500;
      return errorResponse(res, message, status);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { name, phone } = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      const profile = await this.authService.updateProfile(userId, { name, phone });
      return successResponse(res, 'Perfil atualizado com sucesso', profile);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      const status = authErrorStatus(message);
      return errorResponse(res, message, status);
    }
  };

  /** Refresh token: 401 = token inválido/expirado (front usa para deslogar e redirecionar). */
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token é obrigatório', 400);
      }

      const result = await this.authService.refreshToken(refreshToken);
      return successResponse(res, 'Token renovado com sucesso', result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Token inválido ou expirado';
      return errorResponse(res, message, 401);
    }
  };
}
