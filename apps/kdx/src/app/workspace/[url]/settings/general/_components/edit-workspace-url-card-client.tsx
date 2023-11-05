"use client";

import { useState } from "react";
import { revalidatePath } from "next/cache";
import { useRouter, useSearchParams } from "next/navigation";

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

export function EditWorkspaceUrlCardClient({
  workspaceId,
  workspaceUrl,
}: {
  workspaceId: string;
  workspaceUrl: string;
}) {
  const { mutateAsync } = api.workspace.update.useMutation();

  const [newUrl, setNewUrl] = useState(workspaceUrl);
  const router = useRouter();

  return (
    <Card className="w-full text-left">
      <CardHeader>
        <CardTitle>Workspace Url</CardTitle>
        <CardDescription>
          This is your workspace&apos;s visible URL. It will be available under
          /workspaces/{newUrl}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="">Please use 48 characters at maximum.</p>
        <Button
          onClick={async () => {
            const workspace = await mutateAsync({
              workspaceId,
              workspaceUrl: newUrl,
            });
            router.push(`/workspace/${workspace.url}/settings`);
          }}
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
