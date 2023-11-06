"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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

export function EditWorkspaceUrlCardClient({
  workspaceId,
  workspaceUrl,
}: {
  workspaceId: string;
  workspaceUrl: string;
}) {
  const [newUrl, setNewUrl] = useState(workspaceUrl);

  const { mutate, isPending } = api.workspace.update.useMutation({
    onSuccess: (result) => {
      const lastSegment = pathname.split("/").at(-1);
      router.push(
        `/workspace/${result.url}/settings${
          lastSegment !== "settings" ? `/${lastSegment}` : ""
        }`,
      );
      toast({
        variant: "success",
        title: "Workspace URL updated successfully",
      });
    },
    onError: (error) => {
      const errorMessage = error.data?.zodError?.fieldErrors;
      if (errorMessage?.workspaceUrl)
        return toast({
          title: errorMessage?.workspaceUrl?.[0],
          variant: "destructive",
        });

      toast({
        title:
          error.message || "Oops, something went wrong. Please try again later",
        variant: "destructive",
      });
    },
  });

  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
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
              onChange={(e) => {
                if (e.target.value.length <= 48) setNewUrl(e.target.value);
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-4">
        <p className="">Please use 48 characters at maximum.</p>
        <Button
          disabled={isPending}
          onClick={() => {
            const values = {
              workspaceId,
              workspaceUrl: newUrl,
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
