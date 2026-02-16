import { Response } from 'express';
import { AssistantService, CreateAssistantData, UpdateAssistantData } from './assistant.service';
import { successResponse, errorResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middlewares/authMiddleware';

export class AssistantController {
  private assistantService: AssistantService;

  constructor() {
    this.assistantService = new AssistantService();
  }

  create = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;
      const body: CreateAssistantData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }
      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const assistant = await this.assistantService.create(companyId, userId, body);
      return successResponse(res, 'Assistente criado com sucesso', assistant);
    } catch (error: any) {
      const status = error.message?.includes('permissão') ? 403 : error.message?.includes('obrigatório') ? 400 : 500;
      return errorResponse(res, error.message || 'Erro ao criar assistente', status);
    }
  };

  listByCompany = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { companyId } = req.params;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }
      if (!companyId) {
        return errorResponse(res, 'ID da empresa é obrigatório', 400);
      }

      const assistants = await this.assistantService.listByCompany(companyId, userId);
      return successResponse(res, 'Assistentes obtidos com sucesso', assistants);
    } catch (error: any) {
      const status = error.message?.includes('permissão') ? 403 : 500;
      return errorResponse(res, error.message || 'Erro ao listar assistentes', status);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      const { assistantId } = req.params;
      const body: UpdateAssistantData = req.body;

      if (!userId) {
        return errorResponse(res, 'Usuário não autenticado', 401);
      }
      if (!assistantId) {
        return errorResponse(res, 'ID do assistente é obrigatório', 400);
      }

      const assistant = await this.assistantService.update(assistantId, userId, body);
      return successResponse(res, 'Assistente atualizado com sucesso', assistant);
    } catch (error: any) {
      const status = error.message?.includes('permissão') || error.message?.includes('não encontrado') ? 403 : 500;
      return errorResponse(res, error.message || 'Erro ao atualizar assistente', status);
    }
  };
}
