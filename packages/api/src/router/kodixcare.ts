import { createTRPCRouter, protectedProcedure } from "../trpc";

export const kodixCareRouter = createTRPCRouter({
  onboardingCompleted: protectedProcedure.query(() => {
    return false;
  }),
});
