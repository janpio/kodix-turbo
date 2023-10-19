"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export const NextAuthProvider = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export function NextThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
