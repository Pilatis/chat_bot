'use client';

import React, { useState } from 'react';
import { WhatsAppContext } from '../context/whatsapp-context';
import { WhatsAppContextType, WhatsAppSession, CreateSessionData, SocketState, SendMessageData, type WhatsAppResult } from '../types/whatsapp.types';
import { useApi } from '../hooks/use-api';
import { useToast } from '../hooks/useToast';

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentSession, setCurrentSession] = useState<WhatsAppSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();
  const { showSuccess, showError } = useToast();

  const clearError = (): void => setError(null);

  const createSession = async (data: CreateSessionData): Promise<WhatsAppSession | null> => {
    try {
      setIsConnecting(true);
      setIsLoading(true);
      setError(null);

      const response = await api.post('/whatsapp/session', data);

      if (response.data?.success) {
        const sessionData = response.data.data;
        const session: WhatsAppSession = {
          sessionName: sessionData.sessionName,
          qrCode: sessionData.qrCode,
          status: 'QR_READY',
          isConnected: false
        };

        setCurrentSession(session);
        if (sessionData.qrCode) {
          setQrCode(sessionData.qrCode);
        }
        showSuccess(response.data?.message || 'Sessão criada. Escaneie o QR Code.');
        return session;
      }
      const msg = response.data?.message || 'Erro ao criar sessão';
      showError(msg);
      setError(msg);
      return null;
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao criar sessão';
      showError(msg);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
      setIsConnecting(false);
    }
  };

  const getQRCode = async (sessionName: string): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/whatsapp/session/${sessionName}/qrcode`);
      
      if (response.data?.success) {
        const qrCodeData = response.data.data?.qrCode;
        if (qrCodeData) {
          setQrCode(qrCodeData);
          setCurrentSession(prev => prev ? { ...prev, qrCode: qrCodeData } : null);
          return qrCodeData;
        }
        return null;
      } else {
        const msg = response.data?.message || 'QR Code não disponível';
        showError(msg);
        setError(msg);
        return null;
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao obter QR Code';
      showError(msg);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionStatus = async (sessionName: string): Promise<SocketState | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/whatsapp/session/${sessionName}/status`);
      
      if (response.data?.success) {
        const statusData = response.data.data;
        const status = statusData.status as SocketState;
        const isConnected = statusData.isConnected;
        
        // Atualizar ou criar sessão no estado
        setCurrentSession(prev => {
          if (prev && prev.sessionName === sessionName) {
            return {
              ...prev,
              status,
              isConnected
            };
          } else {
            // Criar nova sessão no estado se não existir
            return {
              sessionName,
              status,
              isConnected
            };
          }
        });
        
        return status;
      } else {
        const msg = response.data?.message || 'Erro ao obter status';
        showError(msg);
        setError(msg);
        return null;
      }
    } catch (err: unknown) {
      setCurrentSession(prev => {
        if (prev?.sessionName === sessionName) {
          return null;
        }
        return prev;
      });
      const msg = (err as Error).message || 'Erro ao obter status da sessão';
      showError(msg);
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSession = async (sessionName: string): Promise<WhatsAppResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.deleted(`/whatsapp/session/${sessionName}`);

      if (response.data?.success) {
        setCurrentSession(null);
        setQrCode(null);
        showSuccess(response.data?.message || 'WhatsApp desconectado com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao desconectar sessão';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao desconectar sessão';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: SendMessageData): Promise<WhatsAppResult> => {
    try {
      setIsLoading(true);
      setError(null);

      const { sessionName, phoneNumber, message } = data;

      if (!sessionName || !phoneNumber || !message) {
        const msg = 'Nome da sessão, número de telefone e mensagem são obrigatórios';
        showError(msg);
        setError(msg);
        return 'failure';
      }

      const response = await api.post('/whatsapp/send-message', {
        sessionName,
        phoneNumber,
        message
      });

      if (response.data?.success) {
        showSuccess(response.data?.message || 'Mensagem enviada com sucesso');
        return 'success';
      }
      const msg = response.data?.message || 'Erro ao enviar mensagem';
      showError(msg);
      setError(msg);
      return 'failure';
    } catch (err: unknown) {
      const msg = (err as Error).message || 'Erro ao enviar mensagem';
      showError(msg);
      setError(msg);
      return 'failure';
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: WhatsAppContextType = {
    currentSession,
    qrCode,
    isLoading,
    isConnecting,
    error,
    createSession,
    getQRCode,
    getSessionStatus,
    disconnectSession,
    sendMessage,
    clearError
  };

  return (
    <WhatsAppContext.Provider value={contextValue}>
      {children}
    </WhatsAppContext.Provider>
  );
};

