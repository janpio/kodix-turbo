import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@kdx/api";
import { auth } from "@kdx/auth";

import { CorsOptions, setCorsHeaders } from "../../_enableCors";

export const runtime = "edge";

const handler = auth(async (req) => {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () => createTRPCContext({ auth: req.auth, req }),
  });

  setCorsHeaders(response);
  return response;
});

export { handler as GET, handler as POST, CorsOptions as OPTIONS };
