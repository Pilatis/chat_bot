// Simulação de treinamento de IA
// Em um cenário real, aqui seria integrado com serviços como OpenAI, Google AI, etc.

export interface TrainingData {
  companyName: string;
  products: Array<{
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
  const { companyName, products, companyDescription } = data;
  
  // Simula a criação de um "conhecimento" baseado nos dados
  const knowledge = {
    company: companyName,
    description: companyDescription,
    products: products.map(p => ({
      name: p.name,
      description: p.description,
      price: p.price
    })),
    trainedAt: new Date().toISOString()
  };

  // Em um cenário real, aqui seria salvo em um banco de vetores ou enviado para um serviço de IA
  return JSON.stringify(knowledge);
};

// Simula a resposta da IA baseada na mensagem do cliente
export const generateAIResponse = (
  userMessage: string,
  trainingData: string
): AIResponse => {
  const parsedData = JSON.parse(trainingData);
  const { company, products } = parsedData;

  // Simula análise da mensagem e geração de resposta
  const lowerMessage = userMessage.toLowerCase();
  
  // Respostas baseadas em palavras-chave (simulação)
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return {
      response: `Olá! Bem-vindo(a) à ${company}! Como posso ajudá-lo(a) hoje?`,
      confidence: 0.9,
      suggestedActions: ['Ver produtos', 'Falar com atendente']
    };
  }

  if (lowerMessage.includes('produto') || lowerMessage.includes('produtos')) {
    const productList = products.map((p: { name: string; price: number }) => `• ${p.name} - R$ ${p.price}`).join('\n');
    return {
      response: `Aqui estão nossos produtos:\n${productList}\n\nGostaria de saber mais sobre algum produto específico?`,
      confidence: 0.8,
      suggestedActions: ['Ver detalhes', 'Fazer pedido']
    };
  }

  if (lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
    return {
      response: `Posso ajudá-lo(a) com informações sobre preços. Qual produto te interessa?`,
      confidence: 0.7,
      suggestedActions: ['Ver produtos', 'Falar com vendedor']
    };
  }

  if (lowerMessage.includes('contato') || lowerMessage.includes('telefone')) {
    return {
      response: `Para mais informações, você pode nos contatar através do WhatsApp. Como posso ajudá-lo(a) hoje?`,
      confidence: 0.8,
      suggestedActions: ['Ver produtos', 'Falar com atendente']
    };
  }

  // Resposta padrão quando não consegue identificar a intenção
  return {
    response: `Entendi sua mensagem. Como posso ajudá-lo(a) com informações sobre a ${company}?`,
    confidence: 0.5,
    suggestedActions: ['Ver produtos', 'Falar com atendente', 'Ver informações']
  };
};

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
