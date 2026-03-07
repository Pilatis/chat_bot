import { Response } from 'express';
import { AssistantService, CreateAssistantData, UpdateAssistantData } from './assistant.service';
import { successResponse, errorResponse } from '../../utils/response';
import { TenantRequest } from '../../middlewares/companyMiddleware';

export class AssistantController {
  private assistantService: AssistantService;

  constructor() {
    this.assistantService = new AssistantService();
  }

  create = async (req: TenantRequest, res: Response) => {
    try {
      const body: CreateAssistantData = req.body;
      const assistant = await this.assistantService.create(req.company!.id, body);
      return successResponse(res, 'Assistente criado com sucesso', assistant, 201);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao criar assistente';
      const status = msg.includes('obrigatório') ? 400 : 500;
      return errorResponse(res, msg, status);
    }
  };

  listByCompany = async (req: TenantRequest, res: Response) => {
    try {
      const assistants = await this.assistantService.listByCompany(req.company!.id);
      return successResponse(res, 'Assistentes obtidos com sucesso', assistants);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao listar assistentes';
      return errorResponse(res, msg, 500);
    }
  };

  update = async (req: TenantRequest, res: Response) => {
    try {
      const { assistantId } = req.params;
      if (!assistantId) return errorResponse(res, 'ID do assistente é obrigatório', 400);

      const body: UpdateAssistantData = req.body;
      const assistant = await this.assistantService.update(assistantId, req.company!.id, body);
      return successResponse(res, 'Assistente atualizado com sucesso', assistant);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar assistente';
      const status = msg.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, msg, status);
    }
  };

  delete = async (req: TenantRequest, res: Response) => {
    try {
      const { assistantId } = req.params;
      if (!assistantId) return errorResponse(res, 'ID do assistente é obrigatório', 400);

      const result = await this.assistantService.delete(assistantId, req.company!.id);
      return successResponse(res, 'Assistente deletado com sucesso', result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro ao deletar assistente';
      const status = msg.includes('não encontrado') ? 404 : 500;
      return errorResponse(res, msg, status);
    }
  };
}
