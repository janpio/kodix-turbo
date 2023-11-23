import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import { EditWorkspaceNameCardClient } from "./edit-workspace-name-card-client";

export async function EditWorkspaceNameCard() {
  const session = await auth();
  if (!session) return null;
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {
      id: session.user.activeWorkspaceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <EditWorkspaceNameCardClient
      workspaceId={workspace.id}
      workspaceName={workspace.name}
    />
  );
}
