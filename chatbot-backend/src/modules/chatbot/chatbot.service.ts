import { PrismaClient } from '@prisma/client';
import { trainAIWithCompanyData, generateAIResponse, TrainingData } from '../../utils/trainAI';

const prisma = new PrismaClient();

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
}

export class ChatbotService {
  async processMessage(companyId: string, userId: string, message: ChatMessage): Promise<ChatResponse> {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId },
      include: {
        products: true
      }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Buscar dados de treinamento mais recentes
    const latestTrainingData = await prisma.trainingData.findFirst({
      where: { companyId },
      orderBy: { trainedAt: 'desc' }
    });

    let trainingDataString: string;

    if (latestTrainingData) {
      trainingDataString = JSON.stringify(latestTrainingData.data);
    } else {
      // Se não há dados de treinamento, usar dados básicos da empresa
      const basicTrainingData: TrainingData = {
        companyName: company.name,
        companyDescription: company.description || '',
        whatsappNumber: company.whatsappNumber || '',
        products: company.products.map(product => ({
          name: product.name,
          description: product.description || '',
          price: product.price || 0
        }))
      };

      trainingDataString = trainAIWithCompanyData(basicTrainingData);
    }

    // Gerar resposta da IA
    const aiResponse = generateAIResponse(message.message, trainingDataString);

    // Salvar a mensagem do cliente
    await prisma.message.create({
      data: {
        from: 'CLIENT',
        content: message.message,
        companyId
      }
    });

    // Salvar a resposta do bot
    await prisma.message.create({
      data: {
        from: 'BOT',
        content: aiResponse.response,
        companyId
      }
    });

    return aiResponse;
  }

  async trainAI(companyId: string, userId: string): Promise<{ message: string; trainedData: any }> {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId },
      include: {
        products: true
      }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    // Preparar dados para treinamento
    const trainingData: TrainingData = {
      companyName: company.name,
      companyDescription: company.description || '',
      whatsappNumber: company.whatsappNumber || '',
      products: company.products.map(product => ({
        name: product.name,
        description: product.description || '',
        price: product.price || 0
      }))
    };

    // Processar dados de treinamento
    const trainedDataString = trainAIWithCompanyData(trainingData);
    const trainedData = JSON.parse(trainedDataString);

    // Salvar dados de treinamento no banco
    await prisma.trainingData.create({
      data: {
        companyId,
        data: trainedData
      }
    });

    return {
      message: 'IA treinada com sucesso com os dados da empresa',
      trainedData
    };
  }

  async getTrainingHistory(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const trainingHistory = await prisma.trainingData.findMany({
      where: { companyId },
      orderBy: { trainedAt: 'desc' },
      select: {
        id: true,
        trainedAt: true,
        data: true
      }
    });

    return trainingHistory;
  }

  async getChatHistory(companyId: string, userId: string, limit: number = 50) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const messages = await prisma.message.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return messages.reverse(); // Retornar em ordem cronológica
  }

  async getChatStats(companyId: string, userId: string) {
    // Verificar se a empresa pertence ao usuário
    const company = await prisma.company.findFirst({
      where: { id: companyId, ownerId: userId }
    });

    if (!company) {
      throw new Error('Empresa não encontrada ou não pertence ao usuário');
    }

    const stats = await prisma.message.groupBy({
      by: ['from'],
      where: { companyId },
      _count: {
        id: true
      }
    });

    const totalMessages = await prisma.message.count({
      where: { companyId }
    });

    const todayMessages = await prisma.message.count({
      where: {
        companyId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return {
      totalMessages,
      todayMessages,
      byType: stats.reduce((acc, stat) => {
        acc[stat.from.toLowerCase()] = stat._count.id;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
