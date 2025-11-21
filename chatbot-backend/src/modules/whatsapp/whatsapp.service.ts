import * as wppconnect from '@wppconnect-team/wppconnect';


export type SocketState = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'QR_READY' | 'OPENING' | 'CLOSE';

export interface WhatsAppSession {
  sessionName: string;
  companyId: string;
  status: SocketState;
  qrCode?: string;
}

export class WhatsAppService {
  private sessions: Map<string, any> = new Map();
  private sessionStatus: Map<string, SocketState> = new Map();
  private sessionQRCodes: Map<string, string> = new Map();

  async createSession(companyId: string, sessionName?: string): Promise<{ qrCode?: string; sessionName: string }> {
    const session = sessionName || `company_${companyId}`;

    // Verificar se já existe uma sessão ativa
    if (this.sessions.has(session)) {
      const status = this.sessionStatus.get(session);
      if (status === 'CONNECTED') {
        throw new Error('Sessão já existe e está conectada');
      }
    }

    try {
      return new Promise((resolve, reject) => {
        let qrCodeResolved = false;

        wppconnect.create({
          session: session,
          catchQR: (base64Qr: string, asciiQR: string) => {
            // Armazenar QR Code
            this.sessionQRCodes.set(session, base64Qr);
            this.sessionStatus.set(session, 'QR_READY');
            if (!qrCodeResolved) {
              qrCodeResolved = true;
              resolve({ qrCode: base64Qr, sessionName: session });
            }
          },
          statusFind: (statusFind: string) => {
            console.log(`[statusFind] Sessão: ${session}, Status: ${statusFind}`);
            // Mapear status do WPPConnect para nosso SocketState
            let socketState: SocketState = 'DISCONNECTED';
            if (statusFind === 'isLogged' || statusFind === 'inChat') {
              socketState = 'CONNECTED';
            } else if (statusFind === 'qrReadSuccess' || statusFind === 'qrReadFail') {
              socketState = 'QR_READY';
            } else if (statusFind === 'notLogged' || statusFind === 'phoneNotConnected') {
              socketState = 'DISCONNECTED';
            }
            this.sessionStatus.set(session, socketState);
          },
          autoClose: 60000, // Tempo em ms (60 segundos) - número, não boolean
          puppeteerOptions: {
            headless: true,
            // Não especificar userDataDir - usar o padrão do WPPConnect
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ]
          }
        })
        .then((client) => {
          console.log(`[createSession] Client recebido para sessão: ${session}`);
          this.sessions.set(session, client);
          this.sessionStatus.set(session, 'CONNECTED');
          console.log(`[createSession] Sessão armazenada. Total de sessões: ${this.sessions.size}`);
          
          // Se já estiver conectado e não foi resolvido com QR Code
          if (!qrCodeResolved) {
            resolve({ sessionName: session });
          }
        })
        .catch((error) => {
          reject(new Error(`Erro ao criar sessão: ${error.message}`));
        });
      });
    } catch (error: any) {
      throw new Error(`Erro ao criar sessão: ${error.message}`);
    }
  }

  async getQRCode(sessionName: string): Promise<string | null> {
    // Verificar se há QR Code armazenado
    const qrCode = this.sessionQRCodes.get(sessionName);
    if (qrCode) {
      return qrCode;
    }

    const status = this.sessionStatus.get(sessionName);
    if (status === 'CONNECTED') {
      return null; // Já conectado, não precisa de QR Code
    }

    throw new Error('QR Code não disponível para esta sessão');
  }

  async getSessionStatus(sessionName: string): Promise<SocketState | null> {
    return this.sessionStatus.get(sessionName) || null;
  }

  private async killBrowserProcess(sessionName: string): Promise<void> {
    try {
      const path = require('path');
      const fs = require('fs');
      const userDataDir = path.join(process.cwd(), 'tokens', sessionName);
      
      // Verificar se o diretório existe
      if (fs.existsSync(userDataDir)) {
        console.log(`[killBrowserProcess] Diretório da sessão existe: ${userDataDir}`);
        // O WPPConnect gerencia os processos, então não precisamos matar manualmente
        // Apenas logamos para debug
      }
    } catch (error: any) {
      console.error(`[killBrowserProcess] Erro ao verificar diretório: ${error.message}`);
    }
  }

  private async recoverSession(sessionName: string): Promise<any> {
    console.log(`[recoverSession] Tentando recuperar sessão: ${sessionName}`);
    
    // Primeiro, tentar verificar se já existe uma sessão ativa
    // Se o erro for "browser is already running", significa que a sessão existe
    // Nesse caso, precisamos usar uma abordagem diferente
    
    try {
      return new Promise((resolve, reject) => {
        let resolved = false;
        let browserRunningError = false;
        
        // Não especificar userDataDir para usar o padrão do WPPConnect
        // Isso permite reutilizar a sessão existente se ela já estiver rodando
        wppconnect.create({
          session: sessionName,
          catchQR: (base64Qr: string, asciiQR: string) => {
            // Se pediu QR Code, a sessão não existe ou foi desconectada
            if (!resolved) {
              resolved = true;
              reject(new Error('Sessão não encontrada. É necessário conectar o WhatsApp novamente.'));
            }
          },
          statusFind: (status) => {
            console.log(`[recoverSession] Status encontrado: ${status}`);
            // Mapear status do WPPConnect para nosso SocketState
            let socketState: SocketState = 'DISCONNECTED';
            if (status === 'isLogged' || status === 'inChat') {
              socketState = 'CONNECTED';
            } else if (status === 'qrReadSuccess' || status === 'qrReadFail') {
              socketState = 'QR_READY';
            } else if (status === 'notLogged' || status === 'phoneNotConnected') {
              socketState = 'DISCONNECTED';
            }
            this.sessionStatus.set(sessionName, socketState);
          },
          autoClose: 60000,
          puppeteerOptions: {
            headless: true,
            // Não especificar userDataDir - usar o padrão do WPPConnect
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ]
          }
        })
        .then((client) => {
          if (!resolved) {
            resolved = true;
            console.log(`[recoverSession] Sessão recuperada com sucesso: ${sessionName}`);
            this.sessions.set(sessionName, client);
            this.sessionStatus.set(sessionName, 'CONNECTED');
            resolve(client);
          }
        })
        .catch((error) => {
          if (!resolved) {
            resolved = true;
            // Se o erro for sobre browser já rodando, significa que a sessão existe mas não está no Map
            if (error.message && error.message.includes('browser is already running')) {
              console.log(`[recoverSession] Browser já está rodando para a sessão: ${sessionName}`);
              console.log(`[recoverSession] Isso significa que a sessão existe no WPPConnect mas não está no Map em memória.`);
              console.log(`[recoverSession] Solução: O usuário precisa desconectar e reconectar para sincronizar o estado.`);
              reject(new Error('A sessão do WhatsApp está rodando mas não está sincronizada. Por favor, desconecte e reconecte o WhatsApp na interface para sincronizar o estado.'));
            } else {
              console.error(`[recoverSession] Erro ao recuperar sessão: ${error.message}`);
              reject(error);
            }
          }
        });
        
        // Timeout de segurança
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            reject(new Error('Timeout ao recuperar sessão. A sessão pode não existir ou estar desconectada.'));
          }
        }, 10000); // 10 segundos de timeout
      });
    } catch (error: any) {
      console.error(`[recoverSession] Erro ao recuperar sessão: ${error.message}`);
      throw error;
    }
  }

  async sendMessage(sessionName: string, phoneNumber: string, message: string): Promise<boolean> {
    console.log(`[sendMessage] Tentando enviar mensagem para sessão: ${sessionName}`);
    console.log(`[sendMessage] Sessões disponíveis:`, Array.from(this.sessions.keys()));
    console.log(`[sendMessage] Status da sessão:`, this.sessionStatus.get(sessionName));
    
    let client = this.sessions.get(sessionName);
    
    // Se não encontrou o client, tentar recuperar a sessão
    if (!client) {
      console.log(`[sendMessage] Client não encontrado. Tentando recuperar sessão...`);
      const status = this.sessionStatus.get(sessionName);
      
      // Tentar recuperar a sessão mesmo se o status não estiver definido
      // O WPPConnect pode ter a sessão salva em arquivo mesmo que não esteja no Map
      try {
        console.log(`[sendMessage] Tentando recuperar sessão do WPPConnect...`);
        client = await this.recoverSession(sessionName);
        console.log(`[sendMessage] Sessão recuperada com sucesso!`);
      } catch (error: any) {
        console.error(`[sendMessage] Erro ao recuperar sessão: ${error.message}`);
        console.error(`[sendMessage] Status da sessão era: ${status || 'undefined'}`);
        
        // Se o erro for sobre browser já rodando, significa que a sessão existe mas não está no Map
        // Nesse caso, pedir para reconectar
        if (error.message.includes('browser is already running')) {
          throw new Error('A sessão do WhatsApp está rodando mas não está acessível. Por favor, desconecte e reconecte o WhatsApp.');
        }
        
        throw new Error(`Sessão não encontrada ou não conectada. Erro: ${error.message}`);
      }
    }

    // Verificar se a sessão está conectada
    const status = this.sessionStatus.get(sessionName);
    console.log(`[sendMessage] Status atual: ${status}`);
    if (status !== 'CONNECTED') {
      throw new Error(`Sessão não está conectada. Status atual: ${status || 'NOT_FOUND'}. Conecte o WhatsApp antes de enviar mensagens.`);
    }

    // Validar e formatar número de telefone
    // Remove caracteres não numéricos
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    console.log(`[sendMessage] Número limpo: ${cleanPhone}, tamanho: ${cleanPhone.length}`);
    
    // Se não começar com código do país, assume Brasil (55)
    let formattedPhone = cleanPhone;
    if (!cleanPhone.startsWith('55')) {
      // Se tem 10 ou 11 dígitos, adiciona código do país (55)
      if (cleanPhone.length === 10 || cleanPhone.length === 11) {
        formattedPhone = `55${cleanPhone}`;
        console.log(`[sendMessage] Número formatado: ${formattedPhone}`);
      } else if (cleanPhone.length < 10) {
        throw new Error('Número de telefone inválido. Use o formato com código do país (ex: 5511999999999)');
      }
    }
    
    // Validar tamanho mínimo
    if (formattedPhone.length < 12) {
      throw new Error(`Número de telefone inválido. Tamanho mínimo: 12 dígitos (código do país + DDD + número). Recebido: ${formattedPhone.length} dígitos`);
    }

    try {
      // Formato esperado: 5511999999999@c.us
      const whatsappNumber = `${formattedPhone}@c.us`;
      await client.sendText(whatsappNumber, message);
      return true;
    } catch (error: any) {
      throw new Error(`Erro ao enviar mensagem: ${error.message}`);
    }
  }

  async disconnectSession(sessionName: string): Promise<void> {
    const client = this.sessions.get(sessionName);
    if (client) {
      try {
        await client.logout();
        this.sessions.delete(sessionName);
        this.sessionStatus.delete(sessionName);
        this.sessionQRCodes.delete(sessionName);
      } catch (error: any) {
        throw new Error(`Erro ao desconectar sessão: ${error.message}`);
      }
    }
  }

  async getAllSessions(): Promise<string[]> {
    return Array.from(this.sessions.keys());
  }

  async getAllSessionsWithStatus(): Promise<Array<{ sessionName: string; status: SocketState | null; hasClient: boolean }>> {
    const allSessions = new Set<string>();
    
    // Adicionar todas as sessões que têm client
    this.sessions.forEach((_, sessionName) => {
      allSessions.add(sessionName);
    });
    
    // Adicionar todas as sessões que têm status
    this.sessionStatus.forEach((_, sessionName) => {
      allSessions.add(sessionName);
    });

    return Array.from(allSessions).map(sessionName => ({
      sessionName,
      status: this.sessionStatus.get(sessionName) || null,
      hasClient: this.sessions.has(sessionName)
    }));
  }

  isSessionConnected(sessionName: string): boolean {
    const status = this.sessionStatus.get(sessionName);
    return status === 'CONNECTED';
  }
}

// Singleton instance
export const whatsappService = new WhatsAppService();

