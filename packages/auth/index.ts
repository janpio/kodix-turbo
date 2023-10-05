import type { Adapter } from "@auth/core/adapters";
import type { DefaultSession } from "@auth/core/types";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
// import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";

import type { User } from "@kdx/db";
import { prisma } from "@kdx/db";

import { env } from "./env.mjs";

export type { Session } from "next-auth";

// Update this whenever adding new providers so that the client can
export const providers = ["google", "email"] as const;
export type OAuthProviders = (typeof providers)[number];

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
      activeWorkspaceId: string; // Might need fix
      activeWorkspaceName: string;
    } & DefaultSession["user"];
  }
}

function CustomPrismaAdapter(p: typeof prisma): Adapter {
  return {
    ...PrismaAdapter(p),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(data): Promise<any> {
      const user = await p.user.create({
        data: {
          ...data,
          activeWorkspace: {
            create: {
              name: `${data.name ?? ""}'s Workspace`,
            },
          },
        },
      });

      await p.workspace.update({
        where: {
          id: user.activeWorkspaceId,
        },
        data: {
          users: {
            connect: {
              id: user.id,
            },
          },
        },
      });

      return user;
    },
  };
}

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental,
} = NextAuth({
  adapter: {
    ...CustomPrismaAdapter(prisma),
  },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    // EmailProvider({
    //   server: {
    //     host: env.EMAIL_SERVER_HOST,
    //     port: env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: env.EMAIL_SERVER_USER,
    //       pass: env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: env.EMAIL_FROM,
    //   type: "email",
    //   sendVerificationRequest: () => {
    //     throw new Error("Not implemented");
    //   },
    //   id: "",
    //   name: "",
    // }),
  ],
  callbacks: {
    async session({ session, user }) {
      const activeWs = await prisma.workspace.findFirstOrThrow({
        where: {
          activeUsers: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          name: true,
        },
      });
      session.user.activeWorkspaceName = activeWs.name;
      session.user.activeWorkspaceId = (user as User).activeWorkspaceId;

      return session;
    },

    // @TODO - if you wanna have auth on the edge
    // jwt: ({ token, profile }) => {
    //   if (profile?.id) {
    //     token.id = profile.id;
    //     token.image = profile.picture;
    //   }
    //   return token;
    // },

    // @TODO
    // authorized({ request, auth }) {
    //   return !!auth?.user
    // }
  },

  events: {
    // createUser: async (message) => {
    //   //In here, user has already been created in dataBase. Meaning that we can't make activeWorkspaceId non-null by default.
    //   //Could not find a way to override user creation in nextauth.
    //   const firstName = message.user.name
    //     ? message.user.name.split(" ")[0]
    //     : "";
    //   //Create a personal workspace for the user on signup, set it as their active workspace
    //   const workspace = await prisma.workspace.create({
    //     data: {
    //       name: `${firstName ?? ""}'s Workspace`,
    //       users: {
    //         connect: [{ id: message.user.id }],
    //       },
    //     },
    //   });
    //   await prisma.user.update({
    //     where: {
    //       id: message.user.id,
    //     },
    //     data: {
    //       activeWorkspaceId: workspace.id,
    //     },
    //   });
    // },
  },

  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signIn",
    //signOut: '/auth/signout',
    //error: '/auth/error', // Error code passed in query string as ?error=
    //verifyRequest: '/auth/verify-request', // (used for check email message)
    //newUser: "/auth/new-user"
  },
});
