import type { ConversationStatus } from './types';

export function getConversationStatusColor(status: ConversationStatus): 'green' | 'orange' {
  return status === 'responded' ? 'green' : 'orange';
}

export function getConversationStatusLabel(status: ConversationStatus): string {
  return status === 'responded' ? 'Respondido' : 'Pendente';
}
