import { z } from "zod";

import type { Session } from "@kdx/auth";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure
    .input(z.object({}))
    .output(z.custom<Session | null>())
    .meta({ openapi: { method: "GET", path: "/auth/getSession" } })
    .query(({ ctx }) => {
      return ctx.session;
    }),
  getSecretMessage: protectedProcedure
    .input(z.object({}))
    .output(z.string())
    .meta({ openapi: { method: "GET", path: "/auth/getSecretMessage" } })
    .query(() => {
      // testing type validation of overridden next-auth Session in @kdx/auth package
      return "you can see this secret message!";
    }),
});
