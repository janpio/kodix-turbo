import { unstable_cache } from "next/cache";

import type { RouterOutputs } from "@kdx/api";
import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import { HomePage } from "./_home";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
  if (session) {
    const getActiveWorkspace = unstable_cache(
      async () => await api.workspace.getActiveWorkspace.query(),
      ["activeWorkspace"],
      {
        tags: ["activeWorkspace"],
      },
    )();

    initialData = await getActiveWorkspace;
  }

  return <HomePage initialData={initialData} />;
}
