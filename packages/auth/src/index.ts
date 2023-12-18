import type { Adapter } from "@auth/core/adapters";
import type { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import cuid from "cuid";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
// import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";

import type { PrismaClient } from "@kdx/db";
import { prisma } from "@kdx/db";

import { env } from "../env.js";
import { sendVerificationRequest } from "./email/send-verification-request.js";

export type { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      activeWorkspaceId: string; // Might need fix
      activeWorkspaceName: string;
    } & DefaultSession["user"];
  }
}

const customUserInclude = {
  include: {
    activeWorkspace: {
      select: {
        name: true,
      },
    },
  },
};

function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    ...PrismaAdapter(p),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(data): Promise<any> {
      const userId = cuid();
      const wsId = cuid();

      //! When changing workspace creation flow here, change it on api.workspace.create router as well!
      const user = await p.user.create({
        data: {
          id: userId,
          ...data,
          activeWorkspace: {
            connectOrCreate: {
              create: {
                id: wsId,
                name: `Personal Workspace`,
                ownerId: userId,
              },
              where: {
                id: wsId,
              },
            },
          },
          workspaces: {
            connect: {
              id: wsId,
            },
          },
        },
      });

      return user;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getUser(id): Promise<any> {
      const user = await p.user.findUnique({
        where: {
          id,
        },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeWorkspaceName: user.activeWorkspace.name };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getUserByEmail(email): Promise<any> {
      const user = await p.user.findUnique({
        where: { email },
        ...customUserInclude,
      });
      if (!user) return null;
      return { ...user, activeWorkspaceName: user.activeWorkspace.name };
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getSessionAndUser(sessionToken): Promise<any> {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: {
          user: {
            ...customUserInclude,
          },
        },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return {
        user: { ...user, activeWorkspaceName: user.activeWorkspace.name },
        session,
      };
    },
  };
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: {
    ...CustomPrismaAdapter(prisma),
  },
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      name: "email",
      server: "",
      from: "invitation@kodix.com.br",
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id;

      session.user.activeWorkspaceName = (
        user as typeof user & { activeWorkspaceName: string }
      ).activeWorkspaceName;
      session.user.activeWorkspaceId = (
        user as typeof user & { activeWorkspaceId: string }
      ).activeWorkspaceId;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});
