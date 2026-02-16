'use client';

import React from 'react';
import { Provider } from '@/providers/chakra-provider';
import { Toaster } from '@/components/ui/toaster';
import { BaseProvider } from '@/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      <BaseProvider>
        {children}
      </BaseProvider>
      <Toaster />
    </Provider>
  );
}
