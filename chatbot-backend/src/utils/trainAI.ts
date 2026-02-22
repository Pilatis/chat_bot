// Geração de resposta: Gemini (quando GEMINI_API_KEY configurada) ou fallback mock.

import { generateText } from '../services/gemini.service';

export interface TrainingData {
  companyName: string;
  products: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  services: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  companyDescription: string;
  whatsappNumber?: string;
}

export interface AIResponse {
  response: string;
  confidence: number;
  suggestedActions?: string[];
}

// Simula o processamento e treinamento dos dados da empresa
export const trainAIWithCompanyData = (data: TrainingData): string => {
  const { companyName, products, services, companyDescription } = data;

  const knowledge = {
    company: companyName,
    description: companyDescription,
    products: (products || []).map(p => ({
      name: p.name,
      description: p.description,
      price: p.price
    })),
    services: (services || []).map(s => ({
      name: s.name,
      description: s.description,
      price: s.price
    })),
    trainedAt: new Date().toISOString()
  };

  return JSON.stringify(knowledge);
};

/** Monta o prompt de sistema para o Gemini com os dados da empresa */
function buildSystemInstruction(trainingData: string): string {
  const parsed = JSON.parse(trainingData);
  const { company, description, products = [], services = [] } = parsed;

  const parts: string[] = [
    'Você é o assistente virtual de atendimento ao cliente da empresa.',
    `Empresa: ${company}.`,
  ];
  if (description) {
    parts.push(`Descrição: ${description}`);
  }
  if (products.length > 0) {
    parts.push(
      'Produtos disponíveis:',
      ...products.map((p: { name: string; description: string; price: number }) =>
        `- ${p.name}: ${p.description || 'Sem descrição'} | Preço: R$ ${p.price ?? 0}`
      )
    );
  }
  if (services.length > 0) {
    parts.push(
      'Serviços disponíveis:',
      ...services.map((s: { name: string; description: string; price: number }) =>
        `- ${s.name}: ${s.description || 'Sem descrição'} | Preço: R$ ${s.price ?? 0}`
      )
    );
  }
  parts.push(
    'Responda sempre em português, de forma clara e objetiva.',
    'Use apenas as informações da empresa fornecidas acima. Se não souber, diga que vai verificar e sugira contato.'
  );
  return parts.join('\n');
}

/** Resposta via Gemini (se GEMINI_API_KEY) ou fallback mock */
export async function generateAIResponse(
  userMessage: string,
  trainingData: string
): Promise<AIResponse> {
  const systemInstruction = buildSystemInstruction(trainingData);
  const geminiResponse = await generateText({
    systemInstruction,
    userMessage,
  });

  if (geminiResponse) {
    return {
      response: geminiResponse,
      confidence: 0.85,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente'],
    };
  }

  return generateAIResponseFallback(userMessage, trainingData);
}

/** Fallback: respostas por palavras-chave quando Gemini não está disponível */
function generateAIResponseFallback(
  userMessage: string,
  trainingData: string
): AIResponse {
  const parsedData = JSON.parse(trainingData);
  const { company, products = [], services = [] } = parsedData;
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return {
      response: `Olá! Bem-vindo(a) à ${company}! Como posso ajudá-lo(a) hoje?`,
      confidence: 0.9,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente'],
    };
  }
  if (lowerMessage.includes('produto') || lowerMessage.includes('produtos')) {
    const productList = products.map((p: { name: string; price: number }) => `• ${p.name} - R$ ${p.price}`).join('\n');
    const text = productList
      ? `Aqui estão nossos produtos:\n${productList}\n\nGostaria de saber mais sobre algum produto específico?`
      : 'No momento não temos produtos cadastrados. Posso ajudar com nossos serviços ou outras informações?';
    return { response: text, confidence: 0.8, suggestedActions: ['Ver detalhes', 'Ver serviços', 'Fazer pedido'] };
  }
  if (lowerMessage.includes('serviço') || lowerMessage.includes('serviços')) {
    const serviceList = services.map((s: { name: string; price: number }) => `• ${s.name} - R$ ${s.price}`).join('\n');
    const text = serviceList
      ? `Aqui estão nossos serviços:\n${serviceList}\n\nGostaria de saber mais sobre algum serviço específico?`
      : 'No momento não temos serviços cadastrados. Posso ajudar com nossos produtos ou outras informações?';
    return { response: text, confidence: 0.8, suggestedActions: ['Ver detalhes', 'Ver produtos', 'Falar com atendente'] };
  }
  if (lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
    return {
      response: 'Posso ajudá-lo(a) com informações sobre preços. Qual produto ou serviço te interessa?',
      confidence: 0.7,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com vendedor'],
    };
  }
  if (lowerMessage.includes('contato') || lowerMessage.includes('telefone')) {
    return {
      response: 'Para mais informações, você pode nos contatar através do WhatsApp. Como posso ajudá-lo(a) hoje?',
      confidence: 0.8,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente'],
    };
  }
  return {
    response: `Entendi sua mensagem. Como posso ajudá-lo(a) com informações sobre a ${company}?`,
    confidence: 0.5,
    suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente', 'Ver informações'],
  };
}

// Simula análise de sentimento (básica)
export const analyzeSentiment = (message: string): 'positive' | 'negative' | 'neutral' => {
  const positiveWords = ['obrigado', 'obrigada', 'ótimo', 'excelente', 'perfeito', 'gostei'];
  const negativeWords = ['ruim', 'péssimo', 'horrível', 'problema', 'erro', 'não gostei'];
  
  const lowerMessage = message.toLowerCase();
  
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
};
