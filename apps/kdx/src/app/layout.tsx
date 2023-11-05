import type { Metadata } from "next";

import "@kdx/ui/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { cookies } from "next/headers";

import { cn, Toaster } from "@kdx/ui";

import { Footer } from "~/components/footer/footer";
import HeaderFooterRemover from "~/components/header-footer-remover";
import { Header } from "~/components/header/header";
import { NextAuthProvider, NextThemeProvider } from "~/components/providers";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeSwitcher } from "~/components/theme-switcher";
import { TRPCReactProvider } from "~/trpc/react";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Kodix",
  description: "Software on demand",
  // openGraph: {
  //   title: "Kodix",
  //   description: "Software on demand",
  //   url: "https://kodix.com.br",
  //   siteName: "Kodix",
  // },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider cookies={cookies().toString()}>
          <NextAuthProvider>
            <NextThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Header />
              <div className="p-8">{props.children}</div>

              <Footer />
              <Toaster />
              {/* UI Design Helpers */}
              {process.env.NODE_ENV !== "production" && (
                <div className="fixed bottom-1 z-50 flex flex-row items-center space-x-1">
                  <ThemeSwitcher />
                  <TailwindIndicator />
                </div>
              )}
            </NextThemeProvider>
          </NextAuthProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
