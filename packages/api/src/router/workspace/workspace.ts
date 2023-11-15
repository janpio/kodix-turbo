import crypto from "crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { prisma } from "@kdx/db";
import { toUrlFriendly } from "@kdx/shared";

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
      let url = toUrlFriendly(input.workspaceName);

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
          ownerId: input.userId,
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
  removeUser: protectedProcedure
    .input(
      z.object({
        workspaceId: z.string().cuid(),
        userId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isUserTryingToRemoveSelfFromWs =
        input.userId === ctx.session.user.id;

      if (isUserTryingToRemoveSelfFromWs) {
        const workspace = await ctx.prisma.workspace.findUnique({
          where: {
            id: input.workspaceId,
          },
          select: {
            ownerId: true,
          },
        });
        if (workspace?.ownerId === ctx.session.user.id) {
          throw new TRPCError({
            message:
              "You are the owner of this workspace. You must transfer ownership first before leaving it",
            code: "BAD_REQUEST",
          });
        }
      }

      //TODO: Implemente role based access control
      const otherWorkspace = await ctx.prisma.workspace.findFirst({
        where: {
          id: {
            not: input.workspaceId,
          },
          users: {
            some: {
              id: input.userId,
            },
          },
        },
      });

      if (!otherWorkspace)
        throw new TRPCError({
          message:
            "The user needs to have at least one workspace. Please create another workspace before removing this user",
          code: "BAD_REQUEST",
        });

      await ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          workspaces: {
            disconnect: {
              id: input.workspaceId,
            },
          },
          activeWorkspaceId: otherWorkspace.id,
        },
      });
    }),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.user.findMany({
      where: {
        workspaces: {
          some: {
            id: ctx.session.user.activeWorkspaceId,
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
      },
    });
  }),
});
