import { auth } from "@kdx/auth";

import { EditWorkspaceNameCardClient } from "./edit-workspace-name-card-client";

export async function EditWorkspaceNameCard() {
  const session = await auth();
  if (!session) return null;

  return (
    <EditWorkspaceNameCardClient
      workspaceId={session.user.activeWorkspaceId}
      workspaceName={session.user.activeWorkspaceName}
    />
  );
}
