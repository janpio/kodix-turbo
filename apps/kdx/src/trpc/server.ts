import { cache } from "react";
import { cookies } from "next/headers";
import {
  createTRPCProxyClient,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";

import { appRouter, createTRPCContext } from "@kdx/api";
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

export const createCaller = cache(async () =>
  appRouter.createCaller(await createTRPCContext({})),
); //Probably don't use this one

// export const helpers = createServerSideHelpers({
//   router: appRouter,
//   ctx: await createTRPCContext({}),
//   transformer, // optional - adds superjson serialization
// });
//Apparently, this one is only for preftch and fetch. It's for dehidrating to the cache I believe.
//Let's not use this for now. To actually call procedures from the server, please use createTRPCProxyClient({}) -- https://trpc.io/docs/server/server-side-calls
