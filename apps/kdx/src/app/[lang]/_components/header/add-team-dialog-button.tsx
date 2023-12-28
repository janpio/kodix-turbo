"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle } from "lucide-react";

import type { Session } from "@kdx/auth";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  toast,
} from "@kdx/ui";

import { defaultSafeActionToastError } from "~/helpers/safe-action/default-action-error-toast";
import { createTeamAction } from "./actions";

export function AddTeamDialogButton({
  session,
  children,
  className,
}: {
  session: Session;
  children?: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [teamName, changeTeamName] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children ?? (
        <DialogTrigger asChild>
          <Button className={cn(className)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Team
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>
            Create a new team and invite your team members
          </DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Acme Inc."
                value={teamName}
                onChange={(e) => changeTeamName(e.target.value)}
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={async () => {
              setIsPending(true);
              const result = await createTeamAction({
                userId: session.user.id,
                teamName: teamName,
              });
              setIsPending(false);
              if (defaultSafeActionToastError(result)) return;
              setOpen(false);
              toast(`Team ${result.data?.name} created`, {
                description: "Successfully created a new team.",
              });
              return router.refresh();
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
