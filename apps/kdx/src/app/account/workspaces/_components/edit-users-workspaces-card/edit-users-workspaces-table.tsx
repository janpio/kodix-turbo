import { redirect } from "next/navigation";

import { getBaseUrl } from "@kdx/api/src/shared";
import { auth } from "@kdx/auth";
import {
  AvatarWrapper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@kdx/ui";

import { api } from "~/trpc/server";
import LeaveWsDropdown from "../leave-ws-dropdown";

export async function EditUserWorkspacesTable() {
  const workspaces = await api.workspace.getAllForLoggedUser.query();

  const session = await auth();
  if (!session) return null;

  return (
    <div className="rounded-md border">
      <Table>
        <TableBody>
          {workspaces.length ? (
            workspaces.map((ws) => (
              <TableRow key={ws.id}>
                <TableCell key={ws.id} className="flex flex-row space-x-4">
                  <div className="flex flex-col">
                    <AvatarWrapper
                      src={`${getBaseUrl()}/api/avatar/${ws.id}`}
                      fallback={ws.name}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{ws.name}</span>
                    {ws.ownerId === session.user.id && (
                      <span className="text-muted-foreground">Owner</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-4">
                    <form
                      action={async () => {
                        "use server";
                        if (ws.ownerId !== session.user.id)
                          await api.user.switchActiveWorkspace.mutate({
                            workspaceId: ws.id,
                          });
                        redirect("/workspace/settings");
                      }}
                    >
                      <Button variant="outline" type="submit">
                        Manage
                      </Button>
                    </form>
                    <LeaveWsDropdown session={session} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={workspaces.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
