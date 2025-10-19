import { Response } from 'express';
import { CompanyService, CreateCompanyData, CreateProductData, UpdateProductData } from './company.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  getCompany = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      const company = await this.companyService.getCompanyByUserId(userId);
      
      if (!company) {
        return successResponse(res, 'Nenhuma empresa encontrada', null);
      }

      return successResponse(res, 'Empresa obtida com sucesso', company);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  createOrUpdateCompany = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { name, description, whatsappNumber }: CreateCompanyData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!name) {
        return errorResponse(res, 'Nome da empresa é obrigatório', 400);
      }

      const company = await this.companyService.createOrUpdateCompany(userId, {
        name,
        description,
        whatsappNumber
      });

      return successResponse(res, 'Empresa salva com sucesso', company);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getProducts = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const products = await this.companyService.getProducts(companyId, userId);
      return successResponse(res, 'Produtos obtidos com sucesso', products);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  createProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const { name, description, price }: CreateProductData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      if (!name) {
        return errorResponse(res, 'Nome do produto é obrigatório', 400);
      }

      const product = await this.companyService.createProduct(companyId, userId, {
        name,
        description: description || '',
        price: price || 0
      });

      return successResponse(res, 'Produto criado com sucesso', product, 201);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  updateProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;
      const { name, description, price }: UpdateProductData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!productId) {
        return errorResponse(res, 'ID do produto é obrigatório', 400);
      }

      const product = await this.companyService.updateProduct(productId, userId, {
        name,
        description,
        price
      });

      return successResponse(res, 'Produto atualizado com sucesso', product);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { productId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!productId) {
        return errorResponse(res, 'ID do produto é obrigatório', 400);
      }

      const result = await this.companyService.deleteProduct(productId, userId);
      return successResponse(res, result.message, null);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };

  getCompanyStats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }

      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const stats = await this.companyService.getCompanyStats(companyId, userId);
      return successResponse(res, 'Estatísticas obtidas com sucesso', stats);
    } catch (error: any) {
      return errorResponse(res, error.message, 500);
    }
  };
}
