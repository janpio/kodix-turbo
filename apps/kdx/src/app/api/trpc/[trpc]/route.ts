import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter, createTRPCContext } from "@kdx/api";

import { CorsOptions, setCorsHeaders } from "../../_enableCors";

export const runtime = "nodejs";

async function handler(req: Request) {
  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    router: appRouter,
    req,
    createContext: () => createTRPCContext(),
  });
  setCorsHeaders(response);
  return response;
}

export { handler as GET, handler as POST, CorsOptions as OPTIONS };
