'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState, type PropsWithChildren } from 'react';
import { ToastProvider } from '../components/ui/Toast';
import { SmoothScroll } from '../components/providers/SmoothScroll';

export default function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </ToastProvider>
    </QueryClientProvider>
  );
}