import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import EditUserWorkspacesTableClient from "./edit-user-workspaces-table-client";

export async function EditUserWorkspacesTable() {
  const workspaces = await api.workspace.getAllForLoggedUser.query();

  const session = await auth();
  if (!session) return null;

  return (
    <EditUserWorkspacesTableClient workspaces={workspaces} session={session} />
  );
}
