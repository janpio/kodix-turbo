import type { TRPCErrorResponse } from "@trpc/server/rpc";
import { cache } from "react";
import { headers } from "next/headers";
import { createTRPCClient, loggerLink, TRPCClientError } from "@trpc/client";
import { callProcedure } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import SuperJSON from "superjson";

import { appRouter, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    session: await auth(),
    headers: heads,
  });
});

export const api = createTRPCClient<typeof appRouter>({
  transformer: SuperJSON,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    /**
     * Custom RSC link that invokes procedures directly in the server component Don't be too afraid
     * about the complexity here, it's just wrapping `callProcedure` with an observable to make it a
     * valid ending link for tRPC.
     */
    () =>
      ({ op }) =>
        observable((observer) => {
          createContext()
            .then((ctx) => {
              return callProcedure({
                procedures: appRouter._def.procedures,
                path: op.path,
                getRawInput: () => Promise.resolve(op.input),
                ctx,
                type: op.type,
              });
            })
            .then((data) => {
              observer.next({ result: { data } });
              observer.complete();
            })
            .catch((cause: TRPCErrorResponse) => {
              observer.error(TRPCClientError.from(cause));
            });
        }),
  ],
});

// export const createCaller = cache(async () =>
// appRouter.createCaller(await createTRPCContext({})),
// ); //Probably don't use this one

// export const helpers = createServerSideHelpers({
//   router: appRouter,
//   ctx: await createTRPCContext({}),
//   transformer, // optional - adds superjson serialization
// });
//Apparently, this one is only for preftch and fetch. It's for dehidrating to the cache I believe.
//Let's not use this for now. To actually call procedures from the server, please use createTRPCProxyClient({}) -- https://trpc.io/docs/server/server-side-calls
