import { kodixCareAppId } from "@kdx/shared";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const kodixCareRouter = createTRPCRouter({
  onboardingCompleted: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.prisma.appTeamConfig.findUnique({
      where: {
        appId_teamId: {
          appId: kodixCareAppId,
          teamId: ctx.session.user.activeTeamId,
        },
        config: {
          path: "$.patientName",
          not: {
            equals: null,
          },
        },
      },
    });
    return !!result;
  }),
});
