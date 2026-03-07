import { Response } from 'express';
import { CompanyService, CreateCompanyData, CreateProductData, UpdateProductData, CreateServiceData, UpdateServiceData } from './company.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';
import { TenantRequest } from '../../middlewares/companyMiddleware';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  listCompanies = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return errorResponse(res, 'Usuário não autenticado', 401);

      const companies = await this.companyService.getCompaniesByUserId(userId);
      return successResponse(res, 'Empresas obtidas com sucesso', companies);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar empresas';
      return errorResponse(res, msg, 500);
    }
  };

  getCompany = async (req: TenantRequest, res: Response) => {
    try {
      const company = await this.companyService.getCompanyById(req.company!.id);
      return successResponse(res, 'Empresa obtida com sucesso', company);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao buscar empresa';
      return errorResponse(res, msg, 500);
    }
  };

  createCompany = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return errorResponse(res, 'Usuário não autenticado', 401);

      const { name, description, whatsappNumber }: CreateCompanyData = req.body;
      if (!name?.trim()) return errorResponse(res, 'Nome da empresa é obrigatório', 400);

      const company = await this.companyService.createCompany(userId, { name, description, whatsappNumber });
      return successResponse(res, 'Empresa criada com sucesso', company, 201);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar empresa';
      return errorResponse(res, msg, 500);
    }
  };

  updateCompany = async (req: TenantRequest, res: Response) => {
    try {
      const { name, description, whatsappNumber } = req.body;
      const company = await this.companyService.updateCompany(req.company!.id, { name, description, whatsappNumber });
      return successResponse(res, 'Empresa atualizada com sucesso', company);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar empresa';
      return errorResponse(res, msg, 500);
    }
  };

  getProducts = async (req: TenantRequest, res: Response) => {
    try {
      const products = await this.companyService.getProducts(req.company!.id);
      return successResponse(res, 'Produtos obtidos com sucesso', products);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar produtos';
      return errorResponse(res, msg, 500);
    }
  };

  createProduct = async (req: TenantRequest, res: Response) => {
    try {
      const { name, description, price, category }: CreateProductData = req.body;
      if (!name) return errorResponse(res, 'Nome do produto é obrigatório', 400);
      if (!category) return errorResponse(res, 'Categoria do produto é obrigatória', 400);

      const product = await this.companyService.createProduct(req.company!.id, {
        name,
        description: description || '',
        price: price ?? 0,
        category
      });
      return successResponse(res, 'Produto criado com sucesso', product, 201);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar produto';
      return errorResponse(res, msg, 500);
    }
  };

  updateProduct = async (req: TenantRequest, res: Response) => {
    try {
      const { productId } = req.params;
      if (!productId) return errorResponse(res, 'ID do produto é obrigatório', 400);

      const { name, description, price, category }: UpdateProductData = req.body;
      const product = await this.companyService.updateProduct(productId, req.company!.id, { name, description, price, category });
      return successResponse(res, 'Produto atualizado com sucesso', product);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar produto';
      return errorResponse(res, msg, 500);
    }
  };

  deleteProduct = async (req: TenantRequest, res: Response) => {
    try {
      const { productId } = req.params;
      if (!productId) return errorResponse(res, 'ID do produto é obrigatório', 400);

      const result = await this.companyService.deleteProduct(productId, req.company!.id);
      return successResponse(res, result.message, null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao deletar produto';
      return errorResponse(res, msg, 500);
    }
  };

  getServices = async (req: TenantRequest, res: Response) => {
    try {
      const services = await this.companyService.getServices(req.company!.id);
      return successResponse(res, 'Serviços obtidos com sucesso', services);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar serviços';
      return errorResponse(res, msg, 500);
    }
  };

  createService = async (req: TenantRequest, res: Response) => {
    try {
      const { name, description, price, category }: CreateServiceData = req.body;
      if (!name) return errorResponse(res, 'Nome do serviço é obrigatório', 400);
      if (!category) return errorResponse(res, 'Categoria do serviço é obrigatória', 400);

      const service = await this.companyService.createService(req.company!.id, {
        name,
        description: description || '',
        price: price ?? 0,
        category
      });
      return successResponse(res, 'Serviço criado com sucesso', service, 201);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar serviço';
      return errorResponse(res, msg, 500);
    }
  };

  updateService = async (req: TenantRequest, res: Response) => {
    try {
      const { serviceId } = req.params;
      if (!serviceId) return errorResponse(res, 'ID do serviço é obrigatório', 400);

      const { name, description, price, category } = req.body;
      const service = await this.companyService.updateService(serviceId, req.company!.id, { name, description, price, category });
      return successResponse(res, 'Serviço atualizado com sucesso', service);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar serviço';
      return errorResponse(res, msg, 500);
    }
  };

  deleteService = async (req: TenantRequest, res: Response) => {
    try {
      const { serviceId } = req.params;
      if (!serviceId) return errorResponse(res, 'ID do serviço é obrigatório', 400);

      const result = await this.companyService.deleteService(serviceId, req.company!.id);
      return successResponse(res, result.message, null);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao deletar serviço';
      return errorResponse(res, msg, 500);
    }
  };

  getCompanyStats = async (req: TenantRequest, res: Response) => {
    try {
      const stats = await this.companyService.getCompanyStats(req.company!.id);
      return successResponse(res, 'Estatísticas obtidas com sucesso', stats);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      return errorResponse(res, msg, 500);
    }
  };
}
