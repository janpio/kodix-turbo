import type { RouterOutputs } from "@kdx/api";
import { appRouter } from "@kdx/api";
import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import { HomePage } from "./home";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
  if (session !== null) {
    const caller = appRouter.workspace.createCaller({ session, prisma });
    initialData = await caller.getActiveWorkspace();
  }

  return <HomePage initialData={initialData} />;
}
