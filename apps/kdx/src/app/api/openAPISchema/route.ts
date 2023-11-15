import { generateOpenApiDocument } from "trpc-openapi";

import { appRouter } from "@kdx/api";
import { getBaseUrl } from "@kdx/api/src/shared";

const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "tRPC OpenAPI",
  version: "1.0.0",
  baseUrl: getBaseUrl(),
});

export function GET() {
  return Response.json({ openApiDocument });
}
