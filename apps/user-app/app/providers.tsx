"use client";

import { Provider } from "jotai";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@repo/ui";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <Provider>
          {children}
        </Provider>
      </SessionProvider>
    </ThemeProvider>
  );
};