import { appsRouter } from "./router/apps";
import { authRouter } from "./router/auth";
import { eventRouter } from "./router/event";
import { postRouter } from "./router/post";
import { testRouter } from "./router/test";
import { todoRouter } from "./router/todo";
import { userRouter } from "./router/user";
import { workspaceRouter } from "./router/workspace/workspace";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  app: appsRouter,
  auth: authRouter,
  user: userRouter,
  workspace: workspaceRouter,
  todo: todoRouter,
  event: eventRouter,
  post: postRouter,
  test: testRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
