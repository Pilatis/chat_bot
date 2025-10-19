import { Request, Response, NextFunction } from 'express';
import { serverErrorResponse } from '../utils/response';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Dados duplicados. Este registro já existe.',
      error: error.meta?.target
    });
  }

  // Erro de registro não encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro não encontrado',
      error: error.message
    });
  }

  // Erro de violação de chave estrangeira
  if (error.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Violação de integridade referencial',
      error: error.message
    });
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: error.message
    });
  }

  // Erro de validação
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      error: error.message
    });
  }

  // Erro padrão
  return serverErrorResponse(res, 'Erro interno do servidor', error.message);
};
