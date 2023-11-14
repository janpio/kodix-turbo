import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import type { AppRouter } from "@kdx/api";
import { getBaseKdxUrl } from "@kdx/shared";

const proxyClient = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${getBaseKdxUrl()}/api/trpc`,
    }),
  ],
});

export const helpers = createServerSideHelpers({
  client: proxyClient,
});
