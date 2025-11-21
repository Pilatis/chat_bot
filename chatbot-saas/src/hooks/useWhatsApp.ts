import { useContext } from 'react';
import { WhatsAppContext } from '../context/whatsapp-context';
import { WhatsAppContextType } from '../types/whatsapp.types';

// Hook para usar WhatsApp
export const useWhatsApp = (): WhatsAppContextType => {
  const context = useContext(WhatsAppContext);
  if (!context) {
    throw new Error('useWhatsApp deve ser usado dentro de um WhatsAppProvider');
  }
  return context;
};


