import type { Metadata } from "next";

import "@kdx/ui/styles/globals.css";

import { cache } from "react";
import { Inter as FontSans } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn, Toaster } from "@kdx/ui";

import { Footer } from "~/app/_components/footer/footer";
import { Header } from "~/app/_components/header/header";
import { NextThemeProvider } from "~/app/_components/providers";
import { TailwindIndicator } from "~/app/_components/tailwind-indicator";
import { ThemeSwitcher } from "~/app/_components/theme-switcher";
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

// Lazy load headers
// eslint-disable-next-line @typescript-eslint/require-await
const getHeaders = cache(async () => headers());

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider headersPromise={getHeaders()}>
          <NextThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <SpeedInsights />
            <Analytics />
            <Toaster richColors closeButton />
            <div className="flex min-h-screen flex-col">
              <Header />
              {props.children}
              <Footer />
            </div>
            {/* UI Design Helpers */}
            {process.env.NODE_ENV !== "production" && (
              <div className="fixed bottom-1 z-50 flex flex-row items-center space-x-1">
                <ThemeSwitcher />
                <TailwindIndicator />
              </div>
            )}
          </NextThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
