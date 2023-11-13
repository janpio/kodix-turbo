import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui";

import { api } from "~/trpc/server";
import { InviteDataTable } from "./invites/data-table-invite";
import { DataTableMembers } from "./members/data-table-members";
import { memberColumns } from "./members/memberColumns";

export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
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

  const initialInvites = await api.workspace.invitation.getAll.query();

  return (
    <Tabs defaultValue="members">
      <TabsList className="">
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <DataTableMembers columns={memberColumns} data={members} />
      </TabsContent>
      <TabsContent value="invites">
        <InviteDataTable initialInvites={initialInvites} />
      </TabsContent>
    </Tabs>
  );
}
