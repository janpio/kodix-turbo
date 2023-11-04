"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

export function signIn() {
  window.open(
    "http://localhost:3000/api/auth/signin/google?" +
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      new URLSearchParams({
        callbackUrl: "http://localhost:3000/auth-redirect",
      }),
  );
}

interface AuthContextType {
  token: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useSession = () => {
  const value = useContext(AuthContext);
  return value;
};

export const AuthProvider = (props: { children: ReactNode }) => {
  const [token, setToken] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/");
      setToken(token);
    }
  }, []);

  return (
    <AuthContext.Provider value={token ? { token } : null}>
      {props.children}
    </AuthContext.Provider>
  );
};

export function NextThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
