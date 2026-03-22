export type ConversationStatus = 'responded' | 'pending';

export interface MockConversationMessage {
  id: string;
  content: string;
  isFromBot: boolean;
  timestamp: Date;
}

export interface MockConversation {
  id: string;
  customerName: string;
  lastMessage: string;
  timestamp: Date;
  status: ConversationStatus;
  conversation: MockConversationMessage[];
}
