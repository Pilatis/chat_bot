// Respostas mockadas até integrar a API (ex.: OpenAI/ChatGPT).
// Em produção: substituir generateAIResponse por chamada à API de chat.

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

/** Resposta mockada por palavras-chave. Trocar por chamada à API quando tiver a key. */
export const generateAIResponse = (
  userMessage: string,
  trainingData: string
): AIResponse => {
  const parsedData = JSON.parse(trainingData);
  const { company, products = [], services = [] } = parsedData;

  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('olá') || lowerMessage.includes('oi')) {
    return {
      response: `Olá! Bem-vindo(a) à ${company}! Como posso ajudá-lo(a) hoje?`,
      confidence: 0.9,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente']
    };
  }

  if (lowerMessage.includes('produto') || lowerMessage.includes('produtos')) {
    const productList = products.map((p: { name: string; price: number }) => `• ${p.name} - R$ ${p.price}`).join('\n');
    const text = productList
      ? `Aqui estão nossos produtos:\n${productList}\n\nGostaria de saber mais sobre algum produto específico?`
      : 'No momento não temos produtos cadastrados. Posso ajudar com nossos serviços ou outras informações?';
    return {
      response: text,
      confidence: 0.8,
      suggestedActions: ['Ver detalhes', 'Ver serviços', 'Fazer pedido']
    };
  }

  if (lowerMessage.includes('serviço') || lowerMessage.includes('serviços')) {
    const serviceList = services.map((s: { name: string; price: number }) => `• ${s.name} - R$ ${s.price}`).join('\n');
    const text = serviceList
      ? `Aqui estão nossos serviços:\n${serviceList}\n\nGostaria de saber mais sobre algum serviço específico?`
      : 'No momento não temos serviços cadastrados. Posso ajudar com nossos produtos ou outras informações?';
    return {
      response: text,
      confidence: 0.8,
      suggestedActions: ['Ver detalhes', 'Ver produtos', 'Falar com atendente']
    };
  }

  if (lowerMessage.includes('preço') || lowerMessage.includes('valor')) {
    return {
      response: 'Posso ajudá-lo(a) com informações sobre preços. Qual produto ou serviço te interessa?',
      confidence: 0.7,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com vendedor']
    };
  }

  if (lowerMessage.includes('contato') || lowerMessage.includes('telefone')) {
    return {
      response: `Para mais informações, você pode nos contatar através do WhatsApp. Como posso ajudá-lo(a) hoje?`,
      confidence: 0.8,
      suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente']
    };
  }

  return {
    response: `Entendi sua mensagem. Como posso ajudá-lo(a) com informações sobre a ${company}?`,
    confidence: 0.5,
    suggestedActions: ['Ver produtos', 'Ver serviços', 'Falar com atendente', 'Ver informações']
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
