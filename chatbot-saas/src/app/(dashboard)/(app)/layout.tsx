'use client';

import React from 'react';
import { CompanyProvider } from '@/providers/company-provider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CompanyProvider>{children}</CompanyProvider>;
}
