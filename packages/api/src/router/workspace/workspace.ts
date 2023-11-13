import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { updateWorkspaceSchema } from "../../shared";
import {
  createTRPCRouter,
  protectedProcedure,
  userAndWsLimitedProcedure,
} from "../../trpc";
import { invitationRouter } from "./invitation/invitation";

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
      activeWorkspaceUrl:
        workspaces.find((x) => x.id === ctx.session.user.activeWorkspaceId)
          ?.url ?? "",
    };
  }),
  create: protectedProcedure
    .input(z.object({ userId: z.string().cuid(), workspaceName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      let url = input.workspaceName.toLowerCase().split(" ").join("-");

      const workspaces = await ctx.prisma.workspace.findMany({
        where: {
          url,
        },
      });

      if (workspaces.length > 0) {
        url = `${url}-${crypto.randomBytes(4).toString("hex")}`;
      }

      return await ctx.prisma.workspace.create({
        data: {
          name: input.workspaceName,
          url,
          users: input.userId
            ? {
                connect: [{ id: input.userId }],
              }
            : undefined,
        },
      });
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
  update: userAndWsLimitedProcedure
    .input(updateWorkspaceSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.workspaceUrl) {
        const workspacesWithSameUrl = await ctx.prisma.workspace.findMany({
          where: {
            url: input.workspaceUrl,
          },
        });

        if (workspacesWithSameUrl.length > 0)
          throw new TRPCError({
            message:
              "Workspace with same url already exists. Please choose another url",
            code: "CONFLICT",
          });
      }

      return await ctx.prisma.workspace.update({
        where: {
          id: input.workspaceId,
        },
        data: {
          url: input.workspaceUrl,
          name: input.workspaceName,
        },
      });
    }),
  getActiveWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const workspace = await ctx.prisma.workspace.findUniqueOrThrow({
      where: {
        id: ctx.session.user.activeWorkspaceId,
      },
      include: {
        users: true,
      },
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
  invitation: invitationRouter,
});
