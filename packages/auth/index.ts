import crypto from "crypto";
import type { Adapter } from "@auth/core/adapters";
import EmailProvider from "@auth/core/providers/email";
// import EmailProvider from "next-auth/providers/email";
import Google from "@auth/core/providers/google";
import type { DefaultSession } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

import type { PrismaClient } from "@kdx/db";
import { prisma } from "@kdx/db";

import { env } from "./env.mjs";

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
      //TODO: is it possible to do this with less DB calls?
      let url = `${data.name?.toLowerCase()!.split(" ").join("-")}`;

      const workspaces = await p.workspace.findMany({
        where: {
          url,
        },
      });

      if (workspaces.length > 0) {
        url = `${url}-${crypto.randomBytes(4).toString("hex")}`;
      }

      const workspace = await p.workspace.create({
        data: {
          name: `${data.name!}'s Workspace`,
          url,
        },
      });

      const user = await p.user.create({
        data: {
          ...data,
          activeWorkspace: {
            connect: {
              id: workspace.id,
            },
          },
          workspaces: {
            connect: {
              id: workspace.id,
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
  // eslint-disable-next-line @typescript-eslint/unbound-method
  signIn,
  // eslint-disable-next-line @typescript-eslint/unbound-method
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
      server: {
        host: env.AUTH_EMAIL_SERVER_HOST,
        port: env.AUTH_EMAIL_SERVER_PORT,
        auth: {
          user: env.AUTH_EMAIL_SERVER_USER,
          pass: env.AUTH_EMAIL_SERVER_PASSWORD,
        },
      },
      from: env.AUTH_EMAIL_FROM,
      type: "email",
      sendVerificationRequest: () => {
        throw new Error("Not implemented");
      },
      id: "",
      name: "",
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
    signIn: "/signIn",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});
