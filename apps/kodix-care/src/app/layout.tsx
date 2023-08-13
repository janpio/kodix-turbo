import type { Metadata } from "next";

import "~/styles/globals.css";

import { headers } from "next/headers";

import { TRPCReactProvider } from "./providers";

export const metadata: Metadata = {
  title: "Kodix App",
  description: "Example Kodix app description",
  openGraph: {
    title: "Kodix App",
    description: "Simple monorepo with shared backend for web & mobile apps",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Kodix App",
  },
  twitter: {
    card: "summary_large_image",
    site: "Create T3 Turbo",
    creator: "@Gabriel",
  },
};

export default function Layout(props: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TRPCReactProvider headers={headers()}>
          {props.children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
