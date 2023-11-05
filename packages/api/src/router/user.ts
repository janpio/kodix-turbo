import { revalidateTag } from "next/cache";
import { TRPCError } from "@trpc/server";
import { string, z } from "zod";

import { auth } from "@kdx/auth";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findMany();
    if (!user)
      throw new TRPCError({
        message: "No User Found",
        code: "INTERNAL_SERVER_ERROR",
      });

    return user;
  }),
  getOne: protectedProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });
      if (!user)
        throw new TRPCError({
          message: "No User Found",
          code: "INTERNAL_SERVER_ERROR",
        });

      return user;
    }),
  switchActiveWorkspace: protectedProcedure
    .input(z.object({ workspaceId: string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      revalidateTag("activeWorkspace"); //THIS WORKS!!

      const user = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          activeWorkspaceId: input.workspaceId,
        },
        select: {
          workspaces: {
            where: {
              id: input.workspaceId,
            },
            select: {
              url: true,
            },
          },
        },
      });

      if (!user.workspaces[0])
        throw new TRPCError({
          message: "No Workspace Found",
          code: "INTERNAL_SERVER_ERROR",
        });

      return user.workspaces[0];
    }),
  installApp: protectedProcedure
    .input(z.object({ appId: string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.workspace.update({
        where: {
          id: ctx.session.user.activeWorkspaceId,
        },
        data: {
          activeApps: {
            connect: {
              id: input.appId,
            },
          },
        },
      });
    }),
});
