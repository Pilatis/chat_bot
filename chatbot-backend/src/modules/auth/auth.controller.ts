import { Request, Response } from 'express';
import { AuthService, RegisterData, LoginData } from './auth.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { name, email, password }: RegisterData = req.body;

      // Validações básicas
      if (!name || !email || !password) {
        return errorResponse(res, 'Nome, email e senha são obrigatórios', 400);
      }

      if (password.length < 6) {
        return errorResponse(res, 'Senha deve ter pelo menos 6 caracteres', 400);
      }

      const result = await this.authService.register({ name, email, password });
      return successResponse(res, 'Usuário criado com sucesso', result, 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 400);
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password }: LoginData = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Email e senha são obrigatórios', 400);
      }

      const result = await this.authService.login({ email, password });
      return successResponse(res, 'Login realizado com sucesso', result);
    } catch (error: any) {
      return errorResponse(res, error.message, 401);
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
    } catch (error: any) {
      return errorResponse(res, error.message, 404);
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
    } catch (error: any) {
      return errorResponse(res, error.message, 401);
    }
  };
}
