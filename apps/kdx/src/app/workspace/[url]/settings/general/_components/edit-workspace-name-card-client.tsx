"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { updateWorkspaceSchema } from "@kdx/api/src/shared";
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
  useToast,
} from "@kdx/ui";

import { api } from "~/trpc/react";

export function EditWorkspaceNameCardClient({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const { toast } = useToast();
  const utils = api.useUtils();
  const { mutate, isPending } = api.workspace.update.useMutation({
    onSuccess: () => {
      void utils.workspace.getAllForLoggedUser.invalidate();
      toast({
        variant: "success",
        title: "Workspace name updated successfully",
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors;
      if (errorMessage?.workspaceName)
        return toast({
          title: errorMessage?.workspaceName[0],
          variant: "destructive",
        });
      toast({
        title:
          error.message || "Oops, something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

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
              onChange={(e) => {
                if (e.target.value.length <= 32) setNewName(e.target.value);
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="">Please use 32 characters at maximum.</p>
        <Button
          disabled={isPending}
          onClick={() => {
            const values = {
              workspaceId,
              workspaceName: newName,
            };
            const parsed = updateWorkspaceSchema.safeParse(values);
            if (!parsed.success) {
              return toast({
                title: parsed.error.errors[0]?.message,
                variant: "destructive",
              });
            }
            mutate(values);
          }}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
            </>
          ) : (
            <>Save</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
