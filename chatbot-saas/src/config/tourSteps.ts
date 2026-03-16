/**
 * Passos de apresentação do tour guiado por rota.
 * Cada passo pode ter:
 * - id: id do elemento no DOM (ex.: "tour-dashboard-title"). Se vazio, o passo é de overview (sem alvo).
 * - title: título no tooltip
 * - intro: texto explicativo
 * A ordem do array define o fluxo do tour.
 */
export interface TourStepDef {
  id: string;
  title: string;
  intro: string;
}

export type TourStepsByPath = Record<string, TourStepDef[]>;

export const TOUR_STEPS: TourStepsByPath = {
  '/dashboard': [
    { id: '', title: 'Dashboard', intro: 'Aqui você vê métricas e o resumo do seu assistente: total de mensagens, taxa de resposta e gráficos do período.' },
    { id: 'tour-dashboard-title', title: 'Título', intro: 'Título da página e seletor de período (7, 14 ou 30 dias).' },
    { id: 'tour-dashboard-cards', title: 'Cards de métricas', intro: 'Total de mensagens, mensagens hoje, taxa de resposta e horário de pico.' },
    { id: 'tour-dashboard-chart', title: 'Gráfico', intro: 'Volume de mensagens por hora no período selecionado.' },
    { id: 'tour-dashboard-keywords', title: 'Palavras mais citadas', intro: 'Principais termos mencionados pelos clientes.' },
  ],
  '/company': [
    { id: '', title: 'Empresa', intro: 'Configure os dados da sua empresa, produtos e serviços. Essas informações são usadas para treinar o assistente.' },
    { id: 'tour-company-title', title: 'Título', intro: 'Configurações da empresa.' },
    { id: 'tour-company-form', title: 'Dados da empresa', intro: 'Preencha nome, descrição e WhatsApp. Clique em Salvar para gravar.' },
    { id: 'tour-company-save', title: 'Salvar', intro: 'Use este botão para salvar as alterações dos dados da empresa.' },
    { id: 'tour-company-products', title: 'Produtos', intro: 'Lista de produtos. Adicione produtos para enriquecer as respostas do assistente.' },
    { id: 'tour-company-services', title: 'Serviços', intro: 'Lista de serviços oferecidos pela empresa.' },
  ],
  '/chatbot': [
    { id: '', title: 'Assistente', intro: 'Configure e treine seu assistente virtual, e teste as respostas no simulador de conversa.' },
    { id: 'tour-chatbot-title', title: 'Título', intro: 'Área do assistente e status de treino.' },
    { id: 'tour-chatbot-assistant-card', title: 'Meu assistente', intro: 'Nome, descrição e número WhatsApp do assistente. Use os ícones para editar ou excluir.' },
    { id: 'tour-chatbot-train', title: 'Treinar IA', intro: 'Após cadastrar produtos/serviços na página Empresa, use este botão para treinar a IA com esses dados.' },
    { id: 'tour-chatbot-simulator', title: 'Simulador', intro: 'Teste como o assistente responderia a um cliente. Digite uma mensagem e envie.' },
    { id: 'tour-chatbot-tips', title: 'Dicas', intro: 'Sugestões de perguntas para testar o assistente.' },
  ],
  '/analytics': [
    { id: '', title: 'Analytics', intro: 'Analise o desempenho do atendimento: mensagens por período, distribuição horária e palavras mais citadas.' },
    { id: 'tour-analytics-title', title: 'Título', intro: 'Página de analytics.' },
  ],
  '/whatsapp': [
    { id: '', title: 'WhatsApp', intro: 'Conecte e gerencie suas sessões do WhatsApp para receber e enviar mensagens pelo assistente.' },
    { id: 'tour-whatsapp-title', title: 'Título', intro: 'Configuração do WhatsApp.' },
  ],
  '/plans': [
    { id: '', title: 'Planos', intro: 'Veja os planos disponíveis e gerencie sua assinatura.' },
    { id: 'tour-plans-title', title: 'Título', intro: 'Planos e preços.' },
  ],
  '/profile': [
    { id: '', title: 'Perfil', intro: 'Atualize seu nome e telefone.' },
    { id: 'tour-profile-title', title: 'Título', intro: 'Dados do seu perfil.' },
    { id: 'tour-profile-form', title: 'Formulário', intro: 'Altere nome e telefone e salve.' },
  ],
};

export function getTourStepsForPath(pathname: string): TourStepDef[] {
  const normalized = pathname?.replace(/\/$/, '') || '';
  return TOUR_STEPS[normalized] ?? [];
}
