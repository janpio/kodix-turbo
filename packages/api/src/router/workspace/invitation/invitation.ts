import { TRPCError } from "@trpc/server";
import cuid from "cuid";
import { z } from "zod";

import sendEmail from "../../../internal/email/email";
import VercelInviteUserEmail from "../../../internal/email/templates/workspace-invite";
import { getBaseUrl, inviteUserSchema } from "../../../shared";
import { createTRPCRouter, protectedProcedure } from "../../../trpc";

export const invitationRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const invitations = await ctx.prisma.invitation.findMany({
      where: {
        workspaceId: ctx.session.user.activeWorkspaceId,
      },
    });

    return invitations.map((invite) => ({
      inviteId: invite.id,
      inviteEmail: invite.email,
    }));
  }),
  invite: protectedProcedure
    .input(inviteUserSchema)
    //.use(enforceUserHasWorkspace) // TODO: make this a middleware
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.prisma.workspace.findUniqueOrThrow({
        where: {
          id: input.workspaceId,
          users: {
            some: {
              id: ctx.session.user.id,
            },
          },
        },
        select: {
          name: true,
          id: true,
          users: {
            select: {
              email: true,
            },
          },
          Invitations: {
            where: {
              email: {
                in: input.to,
              },
            },
            select: {
              email: true,
            },
          },
        },
      });

      for (const email of input.to)
        if (workspace.users.find((user) => user.email === email))
          throw new TRPCError({
            message: `User ${email} is already a member of this workspace`,
            code: "CONFLICT",
          });

      if (workspace.Invitations[0])
        throw new TRPCError({
          message: `Invitation already sent to ${workspace.Invitations[0].email}`,
          code: "CONFLICT",
        });

      const invitations = input.to.map((email) => ({
        id: cuid(),
        workspaceId: workspace.id,
        email,
      }));
      await ctx.prisma.invitation.createMany({
        data: invitations,
      });

      await Promise.all(
        invitations.map(async (invite) => {
          const result = await sendEmail({
            to: invite.email,
            subject:
              "You have been invited to join a workspace on kodix.com.br",
            react: VercelInviteUserEmail({
              username: "someone",
              userImage: ctx.session.user.image ?? "",
              invitedByUsername: ctx.session.user.name ?? "",
              invitedByEmail: ctx.session.user.email ?? "",
              teamName: workspace.name,
              teamImage: `${getBaseUrl()}/api/avatar/${workspace.name}`,
              inviteLink: `${getBaseUrl()}/workspace/invite/${invite.id}`,
              inviteFromIp: "string",
              inviteFromLocation: "Sao paulo",
            }),
          });
          if (result.error)
            throw new TRPCError({
              message: "Could not send email",
              code: "INTERNAL_SERVER_ERROR",
            });
        }),
      );
    }),
  accept: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().cuid(),
      }),
    )
    //.use(enforceUserHasWorkspace) // TODO: make this a middleware
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user.email)
        throw new TRPCError({
          message: "Not implemented",
          code: "NOT_IMPLEMENTED",
        }); //TODO: WTF do I do about non existing emails? ??

      const invitation = await ctx.prisma.invitation.findUnique({
        where: {
          id: input.invitationId,
          email: ctx.session.user.email,
        },
        select: {
          workspace: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!invitation)
        throw new TRPCError({
          message: "No Invitation Found",
          code: "NOT_FOUND",
        });

      await ctx.prisma.$transaction([
        ctx.prisma.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            workspaces: {
              connect: {
                id: invitation.workspace.id,
              },
            },
            activeWorkspaceId: invitation.workspace.id,
          },
        }),
        ctx.prisma.invitation.delete({
          where: {
            id: input.invitationId,
          },
        }),
      ]);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        invitationId: z.string().cuid(),
      }),
    )
    //.use(enforceUserHasWorkspace) // TODO: make this a middleware
    .mutation(async ({ ctx, input }) => {
      const invitation = await ctx.prisma.invitation.findUnique({
        where: {
          id: input.invitationId,
          workspace: {
            id: ctx.session.user.activeWorkspaceId,
          },
        },
      });

      if (!invitation)
        throw new TRPCError({
          message: "No Invitation Found",
          code: "NOT_FOUND",
        });

      return await ctx.prisma.invitation.delete({
        where: {
          id: input.invitationId,
        },
      });
    }),
});
