"use client";

import { useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@kdx/ui";

import { api } from "~/trpc/react";

export function EditWorkspaceNameCardClient({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const utils = api.useUtils();
  const { mutateAsync } = api.workspace.update.useMutation();

  const [newName, setNewName] = useState(workspaceName);

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>Workspace Name</CardTitle>
        <CardDescription>
          This is your workspace&apos;s visible name
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="">Please use 32 characters at maximum.</p>
        <Button
          onClick={async () => {
            await mutateAsync({
              workspaceId,
              workspaceName: newName,
            });
            void utils.workspace.getAllForLoggedUser.invalidate();
          }}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
