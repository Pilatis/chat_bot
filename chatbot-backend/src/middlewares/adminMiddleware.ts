import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { errorResponse } from '../utils/response';

export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      errorResponse(res, 'Usuário não autenticado', 401);
      return;
    }

    if (req.user.role !== 'ADMIN') {
      errorResponse(res, 'Acesso negado. Apenas administradores podem acessar esta rota', 403);
      return;
    }

    next();
  } catch (error) {
    errorResponse(res, 'Erro na verificação de permissões', 500);
    return;
  }
};

