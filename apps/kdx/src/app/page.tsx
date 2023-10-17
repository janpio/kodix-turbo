import type { RouterOutputs } from "@kdx/api";
import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import { HomePage } from "./_home";

export default async function Home() {
  const session = await auth();

  let initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
  if (session) {
    initialData = await api.workspace.getActiveWorkspace.query();
  }

  return <HomePage initialData={initialData} />;
}
