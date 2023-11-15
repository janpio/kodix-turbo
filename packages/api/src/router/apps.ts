import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const appsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({}))
    .output(
      z.array(
        z.object({
          installed: z.boolean(),
          id: z.string(),
          name: z.string(),
          description: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
          urlApp: z.string(),
        }),
      ),
    )
    .meta({ /* 👉 */ openapi: { method: "GET", path: "/apps/all" } })
    .query(async ({ ctx }) => {
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
        .map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ activeWorkspaces, devPartnerId, subscriptionCost, ...rest }) =>
            rest,
        ); // remove some fields

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
