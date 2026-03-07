import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from './authMiddleware';
import { errorResponse } from '../utils/response';

const prisma = new PrismaClient();

export interface TenantRequest extends AuthenticatedRequest {
  company?: {
    id: string;
    ownerId: string;
    name: string;
  };
}

/**
 * Middleware de tenant — valida que o companyId da URL pertence ao usuário autenticado.
 *
 * Espera que `authMiddleware` já tenha rodado (req.user disponível).
 * Extrai `companyId` de `req.params.companyId`.
 * Se válido, popula `req.company` com os dados básicos da empresa.
 */
export const companyMiddleware = async (
  req: TenantRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const companyId = req.params['companyId'];

    if (!userId) {
      errorResponse(res, 'Usuário não autenticado', 401);
      return;
    }

    if (!companyId) {
      errorResponse(res, 'ID da empresa é obrigatório', 400);
      return;
    }

    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId },
      select: { id: true, ownerId: true, name: true }
    });

    if (!company) {
      errorResponse(res, 'Empresa não encontrada ou não pertence ao usuário', 403);
      return;
    }

    req.company = company;
    next();
  } catch {
    errorResponse(res, 'Erro ao validar acesso à empresa', 500);
  }
};
