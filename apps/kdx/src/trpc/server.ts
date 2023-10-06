import { headers } from "next/headers";
import {
  createTRPCProxyClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";

import type { AppRouter } from "@kdx/api";
import { appRouter, createTRPCContext } from "@kdx/api";

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
        const heads = new Map(headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads);
      },
    }),
  ],
}); //!THIS IS UNSTABLE! DO NOT USE!

export const helpers = createServerSideHelpers({
  router: appRouter,
  ctx: await createTRPCContext({}),
  transformer, // optional - adds superjson serialization
});
//Apparently, this one is only for preftch and fetch. It's for dehidrating to the cache I believe.
//Let's not use this for now. To actually call procedures from the server, please use router.createCaller({}) -- https://trpc.io/docs/server/server-side-calls
