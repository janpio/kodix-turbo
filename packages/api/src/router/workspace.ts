import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const workspaceRouter = createTRPCRouter({
  getAllForLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const workspaces = await ctx.prisma.workspace.findMany({
      where: {
        users: {
          some: {
            id: ctx.session.user.id,
          },
        },
      },
    });

    return {
      workspaces: workspaces,
      activeWorkspaceId: ctx.session.user.activeWorkspaceId,
      activeWorkspaceName: ctx.session.user.activeWorkspaceName,
    };
  }),
  create: protectedProcedure
    .input(z.object({ userId: z.string().cuid(), workspaceName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.create({
        data: {
          name: input.workspaceName,
          users: {
            connect: [{ id: input.userId }],
          },
        },
      });

      return workspace;
    }),
  getOne: protectedProcedure
    .input(z.object({ workspaceId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: input.workspaceId,
        },
      });

      if (!workspace)
        throw new TRPCError({
          message: "No Workspace Found",
          code: "NOT_FOUND",
        });

      return workspace;
    }),
  update: protectedProcedure
    .input(
      z.object({ workspaceId: z.string().cuid(), workspaceName: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.update({
        where: {
          id: input.workspaceId,
        },
        data: {
          name: input.workspaceName,
        },
      });
      return workspace;
    }),
  getActiveWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.prisma.workspace.findUnique({
      where: {
        id: ctx.session.user.activeWorkspaceId,
      },
      include: {
        users: true,
      },
    });
    if (!workspace)
      throw new TRPCError({
        message: "No Workspace Found",
        code: "NOT_FOUND",
      });
    return workspace;
  }),
  installApp: protectedProcedure
    .input(
      z.object({
        appId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const app = await ctx.prisma.app.findUnique({
        where: {
          id: input.appId,
        },
      });
      if (!app)
        throw new TRPCError({
          message: "No App Found",
          code: "NOT_FOUND",
        });

      const workspace = await ctx.prisma.workspace.findUnique({
        where: {
          id: ctx.session.user.activeWorkspaceId,
        },
      });
      if (!workspace)
        throw new TRPCError({
          message: "No Workspace Found",
          code: "NOT_FOUND",
        });

      const installedApp = await ctx.prisma.app.update({
        where: {
          id: input.appId,
        },
        data: {
          activeWorkspaces: {
            connect: {
              id: workspace.id,
            },
          },
        },
      });

      return installedApp;
    }),
  uninstallApp: protectedProcedure
    .input(
      z.object({
        appId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const uninstalledApp = await ctx.prisma.workspace.update({
        where: {
          id: ctx.session.user.activeWorkspaceId,
        },
        data: {
          activeApps: {
            disconnect: {
              id: input.appId,
            },
          },
        },
      });

      return uninstalledApp;
    }),
});
