import { z } from "zod";

import { appsRouter } from "./router/apps";
import { authRouter } from "./router/auth";
import { eventRouter } from "./router/event";
import { postRouter } from "./router/post";
import { testRouter } from "./router/test";
import { todoRouter } from "./router/todo";
import { userRouter } from "./router/user";
import { workspaceRouter } from "./router/workspace/workspace";
import { createTRPCRouter, publicProcedure, t } from "./trpc";

export const appRouter = createTRPCRouter({
  app: appsRouter,
  auth: authRouter,
  user: userRouter,
  workspace: workspaceRouter,
  todo: todoRouter,
  event: eventRouter,
  post: postRouter,
  test: testRouter,
  sayHello: publicProcedure
    .meta({ /* 👉 */ openapi: { method: "GET", path: "/say-hello" } })
    .input(z.object({ name: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
