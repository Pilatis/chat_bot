'use client';

import React from 'react';
import { useCompany } from '@/hooks/useCompany';
import { AnalyticsProvider } from '@/providers/analytics-provider';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { company } = useCompany();

  return (
    <AnalyticsProvider companyId={company?.id ?? ''}>
      {children}
    </AnalyticsProvider>
  );
}
