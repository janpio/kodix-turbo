import { TRPCError } from "@trpc/server";
import { z } from "zod";

import sendEmail from "../../../internal/email/email";
import VercelInviteUserEmail from "../../../internal/email/templates/workspace-invite";
import { inviteUserSchema } from "../../../shared";
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

      await Promise.all(
        input.to.map(async (email) => {
          const result = await sendEmail({
            to: email,
            subject:
              "You have been invited to join a workspace on Kodix.com.br",
            react: VercelInviteUserEmail({
              username: "someone",
              userImage: "string",
              invitedByUsername: "string",
              invitedByEmail: "string",
              teamName: "string",
              teamImage: "string",
              inviteLink: "string",
              inviteFromIp: "string",
              inviteFromLocation: "string",
            }),
          });
          if (result.error)
            throw new TRPCError({
              message: "Could not send email",
              code: "INTERNAL_SERVER_ERROR",
            });
        }),
      );

      await ctx.prisma.invitation.createMany({
        data: input.to.map((email) => ({
          workspaceId: workspace.id,
          email,
        })),
      });
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
