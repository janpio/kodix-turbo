/* eslint-disable @typescript-eslint/require-await */
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const testRouter = createTRPCRouter({
  test: publicProcedure
    .input(z.object({ source: z.string() }))
    .query(async ({ input }) => {
      const time = new Date().toISOString();
      return time + input.source;
    }),
});
