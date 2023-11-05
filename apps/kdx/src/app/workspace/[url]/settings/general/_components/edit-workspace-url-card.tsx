import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import { EditWorkspaceUrlCardClient } from "./edit-workspace-url-card-client";

export async function EditWorkspaceUrlCard() {
  const session = await auth();
  if (!session) return null;
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {
      id: session.user.activeWorkspaceId,
    },
    select: {
      id: true,
      url: true,
    },
  });

  return (
    <EditWorkspaceUrlCardClient
      workspaceId={workspace.id}
      workspaceUrl={workspace.url}
    />
  );
}
