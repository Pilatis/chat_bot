export interface Assistant {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  whatsappNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export type AssistantProviderResult = 'success' | 'failure' | void;

export interface AssistantContextType {
  assistants: Assistant[];
  currentAssistant: Assistant | null;
  isLoading: boolean;
  error: string | null;
  createAssistant: (companyId: string, data: CreateAssistantData) => Promise<AssistantProviderResult>;
  updateAssistant: (assistantId: string, data: UpdateAssistantData) => Promise<AssistantProviderResult>;
  refreshAssistants: (companyId: string) => Promise<void>;
  clearError: () => void;
}
