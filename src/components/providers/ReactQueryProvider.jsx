'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function ReactQueryProvider({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000, // 2 minutes default fallback freshness
        gcTime: 15 * 60 * 1000, // 15 minutes cache retention
        refetchOnMount: true,
        refetchOnWindowFocus: true,
        refetchInterval: false, // Disabled global polling for performance
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
