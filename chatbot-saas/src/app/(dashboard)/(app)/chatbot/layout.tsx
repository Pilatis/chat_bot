'use client';

import React from 'react';
import { useCompany } from '@/hooks/useCompany';
import { ChatbotProvider } from '@/providers/chatbot-provider';

export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company } = useCompany();

  return (
    <ChatbotProvider companyId={company?.id ?? ''}>
      {children}
    </ChatbotProvider>
  );
}
