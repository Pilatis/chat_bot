import type { MockConversation } from './types';

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: '1',
    customerName: 'João Silva',
    lastMessage: 'Olá, gostaria de saber sobre os preços',
    timestamp: new Date('2024-01-15T10:30:00'),
    status: 'responded',
    conversation: [
      {
        id: '1',
        content: 'Olá, gostaria de saber sobre os preços',
        isFromBot: false,
        timestamp: new Date('2024-01-15T10:30:00'),
      },
      {
        id: '2',
        content:
          'Olá João! Claro, posso ajudá-lo com informações sobre nossos preços. Qual produto você tem interesse?',
        isFromBot: true,
        timestamp: new Date('2024-01-15T10:31:00'),
      },
      {
        id: '3',
        content: 'Estou interessado no plano básico',
        isFromBot: false,
        timestamp: new Date('2024-01-15T10:32:00'),
      },
      {
        id: '4',
        content:
          'Perfeito! Nosso plano básico custa R$ 59/mês e inclui 500 mensagens. Gostaria de mais detalhes?',
        isFromBot: true,
        timestamp: new Date('2024-01-15T10:33:00'),
      },
    ],
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    lastMessage: 'Preciso de ajuda técnica',
    timestamp: new Date('2024-01-15T09:15:00'),
    status: 'pending',
    conversation: [
      {
        id: '1',
        content: 'Preciso de ajuda técnica',
        isFromBot: false,
        timestamp: new Date('2024-01-15T09:15:00'),
      },
      {
        id: '2',
        content:
          'Olá Maria! Vou conectar você com nosso suporte técnico. Aguarde um momento.',
        isFromBot: true,
        timestamp: new Date('2024-01-15T09:16:00'),
      },
    ],
  },
  {
    id: '3',
    customerName: 'Pedro Costa',
    lastMessage: 'Como faço para cancelar minha assinatura?',
    timestamp: new Date('2024-01-14T16:45:00'),
    status: 'responded',
    conversation: [
      {
        id: '1',
        content: 'Como faço para cancelar minha assinatura?',
        isFromBot: false,
        timestamp: new Date('2024-01-14T16:45:00'),
      },
      {
        id: '2',
        content:
          'Para cancelar sua assinatura, acesse Configurações > Assinatura > Cancelar. Você pode cancelar a qualquer momento.',
        isFromBot: true,
        timestamp: new Date('2024-01-14T16:46:00'),
      },
    ],
  },
];
