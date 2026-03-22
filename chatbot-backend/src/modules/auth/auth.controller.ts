import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { isValidCPF, stripCPF, isValidPhone, stripPhone } from '../../utils/validators';

const FRONTEND_URL = (process.env['FRONTEND_URL'] || 'http://localhost:3000').replace(/\/$/, '');

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
      const { name, email, password, phone, cpf }: RegisterData = req.body;

      if (!name?.trim() || !email?.trim() || !password || !phone?.trim() || !cpf?.trim()) {
        return errorResponse(res, 'Nome, email, CPF, telefone e senha são obrigatórios', 400);
      }

      if (password.length < 8) {
        return errorResponse(res, 'Senha deve ter pelo menos 8 caracteres', 400);
      }

      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        return errorResponse(res, 'Senha deve conter pelo menos 1 letra e 1 número', 400);
      }

      const cleanCpf = stripCPF(cpf);
      if (!isValidCPF(cleanCpf)) {
        return errorResponse(res, 'CPF inválido', 400);
      }

      const cleanPhone = stripPhone(phone);
      if (!isValidPhone(cleanPhone)) {
        return errorResponse(res, 'Telefone inválido', 400);
      }

      const result = await this.authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        cpf: cleanCpf,
        phone: cleanPhone,
        password
      });

      return successResponse(res, result.message, result, 201);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar';
      const status = authErrorStatus(message);
      return errorResponse(res, message, status);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginData = req.body;

      if (!email?.trim() || !password) {
        return errorResponse(res, 'Email e senha são obrigatórios', 400);
      }

      const result = await this.authService.login({ email: email.trim().toLowerCase(), password });
      return successResponse(res, 'Login realizado com sucesso', result);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro no login';
      return errorResponse(res, message, 400);
    }
  };

  verifyEmail = async (req: Request, res: Response) => {
    try {
      const token = req.query['token'] as string;

      if (!token) {
        return res.redirect(`${FRONTEND_URL}/auth/verify-email/confirm?status=error&reason=missing_token`);
      }

      await this.authService.verifyEmail(token);
      return res.redirect(`${FRONTEND_URL}/auth/verify-email/confirm?status=success`);
    } catch {
      return res.redirect(`${FRONTEND_URL}/auth/verify-email/confirm?status=error`);
    }
  };

  resendVerification = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email?.trim()) {
        return errorResponse(res, 'Email é obrigatório', 400);
      }

      await this.authService.resendVerification(email.trim().toLowerCase());
      return successResponse(res, 'Se o email estiver cadastrado, um novo link de verificação foi enviado.', null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao reenviar verificação';
      return errorResponse(res, message, 400);
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email?.trim()) {
        return errorResponse(res, 'Email é obrigatório', 400);
      }

      await this.authService.forgotPassword(email.trim().toLowerCase());
      return successResponse(res, 'Se o email estiver cadastrado, um link de redefinição foi enviado.', null);
    } catch {
      return successResponse(res, 'Se o email estiver cadastrado, um link de redefinição foi enviado.', null);
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return errorResponse(res, 'Token e nova senha são obrigatórios', 400);
      }

      if (password.length < 8) {
        return errorResponse(res, 'Senha deve ter pelo menos 8 caracteres', 400);
      }

      if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        return errorResponse(res, 'Senha deve conter pelo menos 1 letra e 1 número', 400);
      }

      await this.authService.resetPassword(token, password);
      return successResponse(res, 'Senha redefinida com sucesso', null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao redefinir senha';
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
