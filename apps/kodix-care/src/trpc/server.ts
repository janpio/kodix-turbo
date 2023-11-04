import { cookies } from "next/headers";
import {
  createTRPCProxyClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";

import type { AppRouter } from "@kdx/api";

import { getBaseUrl, transformer } from "./shared";

export const api = createTRPCProxyClient<AppRouter>({
  transformer,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    unstable_httpBatchStreamLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        return {
          cookie: cookies().toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
