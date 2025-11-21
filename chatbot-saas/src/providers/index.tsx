import React, { ReactNode } from 'react';
import { ApiProvider } from './api-provider';
import { AuthProvider } from './auth-provider';
import { CompanyProvider } from './company-provider';
import { ChatbotProvider } from './chatbot-provider';
import { AnalyticsProvider } from './analytics-provider';
import { PlansProvider } from './plans-provider';
import { WhatsAppProvider } from './whatsapp-provider';

// Provider para páginas que não precisam de companyId
export const BaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ApiProvider>
      <AuthProvider>
        <PlansProvider>
          <WhatsAppProvider>
            {children}
          </WhatsAppProvider>
        </PlansProvider>
      </AuthProvider>
    </ApiProvider>
  );
};

// Provider para páginas que precisam de companyId
export const CompanyAppProvider: React.FC<{ 
  children: ReactNode; 
  companyId: string; 
}> = ({ children, companyId }) => {
  return (
    <ApiProvider>
      <AuthProvider>
        <PlansProvider>
          <WhatsAppProvider>
            <CompanyProvider>
              <ChatbotProvider companyId={companyId}>
                <AnalyticsProvider companyId={companyId}>
                  {children}
                </AnalyticsProvider>
              </ChatbotProvider>
            </CompanyProvider>
          </WhatsAppProvider>
        </PlansProvider>
      </AuthProvider>
    </ApiProvider>
  );
};

// Exportar todos os providers individuais
export { ApiProvider } from './api-provider';
export { AuthProvider } from './auth-provider';
export { CompanyProvider } from './company-provider';
export { ChatbotProvider } from './chatbot-provider';
export { AnalyticsProvider } from './analytics-provider';
export { PlansProvider } from './plans-provider';
export { WhatsAppProvider } from './whatsapp-provider';

// Exportar todos os hooks
export { useApi } from '../hooks/use-api';
export { useAuth, useRequireAuth } from '../hooks/useAuth';
export { useCompany, useProducts } from '../hooks/useCompany';
export { useChatbot, useChat } from '../hooks/useChatbot';
export { useAnalytics, useMetrics } from '../hooks/useAnalytics';
export { usePlans } from '../hooks/usePlans';
export { useWhatsApp } from '../hooks/useWhatsApp';
