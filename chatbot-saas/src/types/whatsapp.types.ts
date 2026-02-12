// Tipos para WhatsApp
export type SocketState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'OPENING' | 'CLOSE';

export interface WhatsAppSession {
  sessionName: string;
  qrCode?: string;
  status?: SocketState;
  isConnected?: boolean;
}

export interface CreateSessionData {
  companyId: string;
  sessionName?: string;
}

export interface WhatsAppState {
  currentSession: WhatsAppSession | null;
  qrCode: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface SendMessageData {
  sessionName: string;
  phoneNumber: string;
  message: string;
}

export type WhatsAppResult = 'success' | 'failure' | void;

export interface WhatsAppContextType extends WhatsAppState {
  createSession: (data: CreateSessionData) => Promise<WhatsAppSession | null>;
  getQRCode: (sessionName: string) => Promise<string | null>;
  getSessionStatus: (sessionName: string) => Promise<SocketState | null>;
  disconnectSession: (sessionName: string) => Promise<WhatsAppResult>;
  sendMessage: (data: SendMessageData) => Promise<WhatsAppResult>;
  clearError: () => void;
}

