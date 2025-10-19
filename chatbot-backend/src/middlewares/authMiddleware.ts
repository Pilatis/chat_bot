import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      errorResponse(res, 'Token de acesso não fornecido', 401);
      return;
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      errorResponse(res, 'Token de acesso não fornecido', 401);
      return;
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = {
        userId: decoded.userId,
        email: decoded.email
      };
      next();
    } catch (error) {
      errorResponse(res, 'Token inválido ou expirado', 401);
      return;
    }
  } catch (error) {
    errorResponse(res, 'Erro na autenticação', 401);
    return;
  }
};
