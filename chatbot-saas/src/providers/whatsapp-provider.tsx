'use client';

import React, { useState } from 'react';
import { WhatsAppContext } from '../context/whatsapp-context';
import { WhatsAppContextType, WhatsAppSession, CreateSessionData, SocketState, SendMessageData } from '../types/whatsapp.types';
import { useApi } from '../hooks/use-api';

export const WhatsAppProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [currentSession, setCurrentSession] = useState<WhatsAppSession | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { api } = useApi();

  const clearError = (): void => setError(null);

  const createSession = async (data: CreateSessionData): Promise<WhatsAppSession> => {
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
        
        return session;
      } else {
        throw new Error(response.data?.message || 'Erro ao criar sessão');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao criar sessão');
      throw err;
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
        throw new Error(response.data?.message || 'QR Code não disponível');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao obter QR Code');
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
        throw new Error(response.data?.message || 'Erro ao obter status');
      }
    } catch (err: any) {
      // Se a sessão não existe, limpar o estado
      setCurrentSession(prev => {
        if (prev?.sessionName === sessionName) {
          return null;
        }
        return prev;
      });
      setError(err.message || 'Erro ao obter status da sessão');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSession = async (sessionName: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.deleted(`/whatsapp/session/${sessionName}`);
      
      if (response.data?.success) {
        setCurrentSession(null);
        setQrCode(null);
      } else {
        throw new Error(response.data?.message || 'Erro ao desconectar sessão');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao desconectar sessão');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (data: SendMessageData): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { sessionName, phoneNumber, message } = data;
      
      if (!sessionName || !phoneNumber || !message) {
        throw new Error('Nome da sessão, número de telefone e mensagem são obrigatórios');
      }

      const response = await api.post('/whatsapp/send-message', {
        sessionName,
        phoneNumber,
        message
      });
      
      if (response.data?.success) {
        return true;
      } else {
        throw new Error(response.data?.message || 'Erro ao enviar mensagem');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem');
      throw err;
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

