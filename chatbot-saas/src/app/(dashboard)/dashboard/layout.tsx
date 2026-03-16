'use client';

import React from 'react';
import { CompanyProvider } from '@/providers/company-provider';
import { AnalyticsProvider } from '@/providers/analytics-provider';
import { useCompany } from '@/hooks/useCompany';

function DashboardAnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const { company } = useCompany();
  return (
    <AnalyticsProvider companyId={company?.id ?? ''}>
      {children}
    </AnalyticsProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CompanyProvider>
      <DashboardAnalyticsWrapper>{children}</DashboardAnalyticsWrapper>
    </CompanyProvider>
  );
}
