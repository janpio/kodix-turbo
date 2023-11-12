import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui";

import { inviteColumns } from "./invites/inviteColumns";
import { DataTable } from "./members/data-table-members";
import { memberColumns } from "./members/memberColumns";

export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export interface Invite {
  inviteId: string;
  inviteEmail: string;
}

export async function EditWSMembersAndInvitesCard() {
  const session = await auth();
  if (!session) return null;
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {
      id: session.user.activeWorkspaceId,
    },
    select: {
      id: true,
      users: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
        },
      },
    },
  });
  const members = workspace.users satisfies Member[];

  const _invites = await prisma.invitation.findMany({
    where: {
      workspaceId: session.user.activeWorkspaceId,
    },
    select: {
      id: true,
      email: true,
    },
  });

  const invites = _invites.map((invite) => {
    return {
      inviteId: invite.id,
      inviteEmail: invite.email,
    };
  }) satisfies Invite[];

  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <DataTable columns={memberColumns} data={members} />
      </TabsContent>
      <TabsContent value="invites">
        <DataTable columns={inviteColumns} data={invites} />
      </TabsContent>
    </Tabs>
  );
}
