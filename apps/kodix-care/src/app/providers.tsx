"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
import { loggerLink, unstable_httpBatchStreamLink } from "@trpc/client";
import superjson from "superjson";

import { api } from "~/utils/api";

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") return `https://www.kodix.com.br`; // SSR in production should use vercel url
  if (typeof window !== "undefined") return `http://localhost:3000`; // browser should use localhost:3000
  return `http://localhost:3000`; // dev SSR should use localhost
};

export function TRPCReactProvider(props: {
  children: React.ReactNode;
  headers?: Headers;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        unstable_httpBatchStreamLink({
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            const headers = new Map(props.headers);
            headers.set("x-trpc-source", "nextjs-react");
            return Object.fromEntries(headers);
          },
        }),
      ],
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        <api.Provider client={trpcClient} queryClient={queryClient}>
          {props.children}
        </api.Provider>
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
