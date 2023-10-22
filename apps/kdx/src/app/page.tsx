import type { RouterOutputs } from "@kdx/api";
import { auth } from "@kdx/auth";

import { createCaller } from "~/trpc/server";
import { HomePage } from "./_home";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
  if (session) {
    const caller = await createCaller();
    initialData = await caller.workspace.getActiveWorkspace();
  }

  return <HomePage initialData={initialData} />;
}

export const dynamic = "force-dynamic"; //TODO: remove this. Temporary fix https://github.com/t3-oss/create-t3-app/issues/1599/
