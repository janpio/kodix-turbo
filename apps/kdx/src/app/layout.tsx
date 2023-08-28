import type { Metadata } from "next";

import "@kdx/ui/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { headers } from "next/headers";

import { cn, Toaster } from "@kdx/ui";

import { Footer } from "~/components/Footer/footer";
import { Header } from "~/components/Header/Header";
import { TailwindIndicator } from "~/components/tailwind-indicator";
import { ThemeSwitcher } from "~/components/theme-switcher";
import {
  NextAuthProvider,
  NextThemeProvider,
  TRPCReactProvider,
} from "../components/providers";

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
  // const routesLayoutNotNeeded = ["/signIn", "/newUser"];
  // const isLayoutNotNeeded = true;

  return (
    <html lang="en">
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider headers={headers()}>
          <NextAuthProvider>
            <NextThemeProvider>
              <Header />
              {/* {isLayoutNotNeeded && <Header />} */}
              <div className="p-8">{props.children}</div>

              {/* {isLayoutNotNeeded && <Footer />} */}
              <Footer />
              <Toaster />
            </NextThemeProvider>
          </NextAuthProvider>

          {/* UI Design Helpers */}
          {process.env.NODE_ENV !== "production" && (
            <div className="fixed bottom-1 left-20 z-50 flex flex-row items-center space-x-1">
              <div className="flex">
                <ThemeSwitcher />
              </div>
              <TailwindIndicator />
            </div>
          )}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
