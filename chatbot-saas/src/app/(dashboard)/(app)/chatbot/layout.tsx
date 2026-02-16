'use client';

import React from 'react';
import { useCompany } from '@/hooks/useCompany';
import { AssistantProvider } from '@/providers/assistant-provider';
import { ChatbotProvider } from '@/providers/chatbot-provider';

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company } = useCompany();

  return (
    <AssistantProvider>
      <ChatbotProvider companyId={company?.id ?? ''}>
        {children}
      </ChatbotProvider>
    </AssistantProvider>
  );
}
