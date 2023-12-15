import { cookies } from "next/headers";
import {
  createTRPCProxyClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import SuperJSON from "superjson";

import type { AppRouter } from "@kdx/api";
import { getBaseKdxUrl } from "@kdx/shared";

export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    unstable_httpBatchStreamLink({
      url: `${getBaseKdxUrl()}/api/trpc`,
      headers() {
        return {
          cookie: cookies().toString(),
          "x-trpc-source": "rsc",
        };
      },
    }),
  ],
});
