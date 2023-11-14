import { Client } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
import { PrismaClient } from "@prisma/client";
import { fetch as undiciFetch } from "undici";

const client = new Client({
  url: `${process.env.DATABASE_URL}`,
  fetch: undiciFetch,
});

const adapter = new PrismaPlanetScale(client);
const globalForPrisma = globalThis as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: process.env.NODE_ENV === "development" ? null : adapter, //?  Only use Planetscale adapter in production
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
export * from "./extensions";
