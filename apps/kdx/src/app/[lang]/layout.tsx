import type { Metadata } from "next";

import "@kdx/ui/styles/globals.css";

import { cache } from "react";
import { Inter as FontSans } from "next/font/google";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { cn, Toaster } from "@kdx/ui";

import type { Locale } from "../../../i18n.config";
import { Footer } from "~/app/[lang]/_components/footer/footer";
import { Header } from "~/app/[lang]/_components/header/header";
import { NextThemeProvider } from "~/app/[lang]/_components/providers";
import { TailwindIndicator } from "~/app/[lang]/_components/tailwind-indicator";
import { ThemeSwitcher } from "~/app/[lang]/_components/theme-switcher";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";
import { i18n } from "../../../i18n.config";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://kodix.com.br"
      : "http://localhost:3000",
  ),
  title: "Kodix",
  description: "Software on demand",
  // openGraph: {
  //   title: "Kodix",
  //   description: "Software on demand",
  //   url: "https://kodix.com.br",
  //   siteName: "Kodix",
  // },
};

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

// Lazy load headers
const getHeaders = cache(async () => Promise.resolve(headers()));

export default function Layout(props: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={props.params.lang}>
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
              <Header lang={props.params.lang} />
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
