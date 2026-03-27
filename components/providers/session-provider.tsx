'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import React, { ReactNode } from 'react';

/**
 * SessionProvider Component
 * 
 * Wrapper component để cung cấp NextAuth session context cho tất cả các client components.
 * Phải wrap root layout hoặc children để useSession() hook có thể hoạt động.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
