import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";

import "~/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";

import { cn } from "@kdx/ui";

import { TailwindIndicator } from "~/components/TailwindIndicator";
import { TRPCReactProvider } from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Stays IA",
  description: "Crie títulos e descrições para seus anúncios de imóveis!",
  // openGraph: {
  //   title: "Stays IA",
  //   description: "Crie títulos e descrições para seus anúncios de imóveis!",
  //   url: "",
  //   siteName: "Stays IA",
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   site: "Stays IA",
  //   creator: "@Kodix",
  // },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <Script
          type="text/javascript"
          src="https://d335luupugsy2.cloudfront.net/js/rdstation-forms/stable/rdstation-forms.min.js"
        ></Script>
        <TRPCReactProvider headers={headers()}>
          {props.children}
          <Analytics />
          <TailwindIndicator />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
