import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAssistantData {
  name: string;
  description?: string;
  whatsappNumber?: string;
}

export interface UpdateAssistantData {
  name?: string;
  description?: string;
  whatsappNumber?: string;
}

export class AssistantService {
  async create(companyId: string, data: CreateAssistantData) {
    if (!data.name?.trim()) {
      throw new Error('Nome do assistente é obrigatório');
    }
    return prisma.assistant.create({
      data: {
        companyId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        whatsappNumber: data.whatsappNumber?.trim() || null
      }
    });
  }

  async listByCompany(companyId: string) {
    return prisma.assistant.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async update(assistantId: string, companyId: string, data: UpdateAssistantData) {
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, companyId }
    });
    if (!assistant) {
      throw new Error('Assistente não encontrado nesta empresa');
    }
    return prisma.assistant.update({
      where: { id: assistantId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.whatsappNumber !== undefined && { whatsappNumber: data.whatsappNumber?.trim() || null })
      }
    });
  }

  async delete(assistantId: string, companyId: string) {
    const assistant = await prisma.assistant.findFirst({
      where: { id: assistantId, companyId }
    });
    if (!assistant) {
      throw new Error('Assistente não encontrado nesta empresa');
    }
    await prisma.assistant.delete({ where: { id: assistantId } });
    return { message: 'Assistente deletado com sucesso' };
  }
}
