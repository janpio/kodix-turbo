import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";

import { appRouter, createTRPCContext } from "@kdx/api";

export const helpers = createServerSideHelpers({
  router: appRouter,
  ctx: await createTRPCContext({}),
  transformer: superjson, // optional - adds superjson serialization
});
