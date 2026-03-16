export interface TourOverview {
  title: string;
  intro: string;
}

const OVERVIEWS: Record<string, TourOverview> = {
  '/dashboard': {
    title: 'Dashboard',
    intro: 'Aqui você vê métricas e o resumo do seu assistente: total de mensagens, taxa de resposta e gráficos do período.',
  },
  '/company': {
    title: 'Empresa',
    intro: 'Configure os dados da sua empresa, produtos e serviços. Essas informações são usadas para treinar o assistente.',
  },
  '/chatbot': {
    title: 'Assistente',
    intro: 'Configure e treine seu assistente virtual, e teste as respostas no simulador de conversa.',
  },
  '/analytics': {
    title: 'Analytics',
    intro: 'Analise o desempenho do atendimento: mensagens por período, distribuição horária e palavras mais citadas.',
  },
  '/whatsapp': {
    title: 'WhatsApp',
    intro: 'Conecte e gerencie suas sessões do WhatsApp para receber e enviar mensagens pelo assistente.',
  },
  '/plans': {
    title: 'Planos',
    intro: 'Veja os planos disponíveis e gerencie sua assinatura.',
  },
  '/profile': {
    title: 'Perfil',
    intro: 'Atualize seu nome e telefone.',
  },
};

const DEFAULT_OVERVIEW: TourOverview = {
  title: 'Esta tela',
  intro: 'Estes são os principais elementos da interface. Use o tour para conhecer cada parte.',
};

export function getTourOverview(pathname: string): TourOverview {
  const normalized = pathname?.replace(/\/$/, '') || '';
  return OVERVIEWS[normalized] ?? DEFAULT_OVERVIEW;
}
