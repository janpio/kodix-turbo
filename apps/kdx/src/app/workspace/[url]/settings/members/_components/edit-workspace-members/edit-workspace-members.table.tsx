import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@kdx/ui";

import { columns } from "./columns";
import { DataTable } from "./data-table";

export async function EditWorkspaceMemberCard() {
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

  return (
    <Tabs defaultValue="members" className="">
      <TabsList>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="invites">Invites</TabsTrigger>
      </TabsList>
      <TabsContent value="members">
        <DataTable columns={columns} data={workspace.users} />
      </TabsContent>
      <TabsContent value="invites">
        <DataTable columns={columns} data={workspace.users} />
      </TabsContent>
    </Tabs>
  );
}
