import * as React from "react";
import { Loader2 } from "lucide-react";

import type { Session } from "@kdx/auth";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";

/**
 * To use this Dialog, make sure you wrap it in a DialogTrigger component.
 * To activate the AddWorkspaceDialog component from within a Context Menu or Dropdown Menu, you must encase the Context Menu or Dropdown Menu component in the AddWorkspaceDialog component.
 */
export function AddWorkspaceDialog({
  children,
  open,
  onOpenChange,
  session,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  session: Session;
}) {
  const ctx = api.useUtils();
  const { mutateAsync: switchActiveWorkspace } =
    api.user.switchActiveWorkspace.useMutation();
  const { mutateAsync, isPending } = api.workspace.create.useMutation({
    onSuccess: async (workspace) => {
      await switchActiveWorkspace({ workspaceId: workspace.id });
      void ctx.workspace.getAllForLoggedUser.invalidate();
      onOpenChange(false);

      toast(`Workspace ${workspace.name} created`, {
        description: "Successfully created a new workspace.",
      });
    },
    onError: (e) => {
      const zodContentErrors = e.data?.zodError?.fieldErrors.content;
      const zodFormErrors = e.data?.zodError?.formErrors;
      toast.error(
        zodContentErrors?.[0] ??
          zodFormErrors?.[0] ??
          e.message ??
          "Something went wrong, please try again later.",
      );
    },
  });
  const [workspaceName, changeWorkspaceName] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace and invite your team members
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={workspaceName}
                onChange={(e) => changeWorkspaceName(e.target.value)}
              />
            </div>
            {/* <div className="space-y-2">
              <Label htmlFor="plan">Subscription plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">
                    <span className="font-medium">Free</span> -{" "}
                    <span className="text-muted-foreground">
                      Trial for two weeks
                    </span>
                  </SelectItem>
                  <SelectItem value="pro">
                    <span className="font-medium">Pro</span> -{" "}
                    <span className="text-muted-foreground">
                      $9/month per user
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div> This is a nice way to do forms so I am not deleting it yet until ive used it somewhere else*/}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            onClick={() => {
              void mutateAsync({
                userId: session.user.id,
                workspaceName: workspaceName,
              });
            }}
          >
            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
