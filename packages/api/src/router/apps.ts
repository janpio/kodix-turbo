import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      include: {
        activeWorkspaces: true,
      },
    });

    if (!apps.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });
    }

    const appsWithInstalled = apps
      .map((app) => {
        return {
          ...app,
          installed: app.activeWorkspaces.some(
            (workspace) =>
              workspace.id === ctx?.session?.user?.activeWorkspaceId,
          ),
        };
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ activeWorkspaces, ...rest }) => rest); // remove activeWorkspaces field

    return appsWithInstalled;
  }),
  getInstalled: protectedProcedure.query(async ({ ctx }) => {
    const apps = await ctx.prisma.app.findMany({
      where: {
        activeWorkspaces: {
          some: {
            id: ctx.session.user.activeWorkspaceId,
          },
        },
      },
    });

    if (!apps)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No apps found",
      });

    return apps;
  }),
});
