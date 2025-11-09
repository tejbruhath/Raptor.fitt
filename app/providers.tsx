"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ToastProvider } from "@/components/ToastProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
