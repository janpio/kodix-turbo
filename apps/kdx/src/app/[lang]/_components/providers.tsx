"use client";

import type { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider } from "next-themes";

//export const NextAuthProvider = ({
//  children,
//}: {
//  children?: React.ReactNode;
//}) => {
//  return <SessionProvider>{children}</SessionProvider>;
//}; //? This is not being used at the moment.

export function NextThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <ThemeProvider {...props}>{children}</ThemeProvider>;
}
