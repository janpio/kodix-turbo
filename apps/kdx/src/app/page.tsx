import { unstable_cache } from "next/cache";

import type { RouterOutputs } from "@kdx/api";
import { auth } from "@kdx/auth";

import { createCaller } from "~/trpc/server";
import { HomePage } from "./_home";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
  if (session) {
    const getActiveWorkspace = unstable_cache(
      async () => {
        const caller = await createCaller();
        const data = await caller.workspace.getActiveWorkspace();
        return data;
      },
      ["activeWorkspace"],
      {
        tags: ["activeWorkspace"],
      },
    )();

    initialData = await getActiveWorkspace;
  }

  return <HomePage initialData={initialData} />;
}

//export const dynamic = "force-dynamic"; //TODO: remove this. Temporary fix https://github.com/t3-oss/create-t3-app/issues/1599/
