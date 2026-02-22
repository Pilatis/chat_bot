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
  async create(companyId: string, userId: string, data: CreateAssistantData) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });
    if (!company) {
      throw new Error('Empresa não encontrada ou você não tem permissão');
    }
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

  async listByCompany(companyId: string, userId: string) {
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });
    if (!company) {
      throw new Error('Empresa não encontrada ou você não tem permissão');
    }
    return prisma.assistant.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async update(assistantId: string, userId: string, data: UpdateAssistantData) {
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { company: true }
    });
    if (!assistant || assistant.company.ownerId !== userId) {
      throw new Error('Assistente não encontrado ou você não tem permissão');
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

  async delete(assistantId: string, userId: string) {
    const assistant = await prisma.assistant.findUnique({
      where: { id: assistantId },
      include: { company: true }
    });
    if (!assistant || assistant.company.ownerId !== userId) {
      throw new Error('Assistente não encontrado ou você não tem permissão');
    }
    await prisma.assistant.delete({
      where: { id: assistantId }
    });
    return { message: 'Assistente deletado com sucesso' };
  }
}
