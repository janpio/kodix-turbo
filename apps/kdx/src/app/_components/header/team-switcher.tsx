"use client";

import * as React from "react";
import Link from "next/link";
import { redirect, usePathname, useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  PlusCircle,
  Settings,
} from "lucide-react";

import type { RouterOutputs } from "@kdx/api";
import { getBaseUrl } from "@kdx/api/src/shared";
import type { Session } from "@kdx/auth";
import {
  AvatarWrapper,
  Button,
  buttonVariants,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DialogTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@kdx/ui";

import { api } from "~/trpc/react";
import { AddWorkspaceDialog } from "./add-workspace-dialog";

export function TeamSwitcher({
  session,
  initialWorkspaces,
}: {
  session: Session;
  initialWorkspaces: RouterOutputs["workspace"]["getAllForLoggedUser"];
}) {
  const utils = api.useUtils();
  const router = useRouter();
  const { isPending, mutateAsync: switchActiveWorkspace } =
    api.user.switchActiveWorkspace.useMutation();

  const { data } = api.workspace.getAllForLoggedUser.useQuery(undefined, {
    initialData: initialWorkspaces,
  });

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  if (!data) return null;

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
      session={session}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="center flex justify-center rounded-lg">
          <Link
            href={`/workspace`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "justify-start hover:bg-inherit",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <Skeleton className="mx-3 h-3 w-full" />
              </>
            ) : (
              <>
                <AvatarWrapper
                  className="mr-2 h-5 w-5"
                  src={`${getBaseUrl()}/api/avatar/${
                    session.user.activeWorkspaceName
                  }`}
                  alt={session.user.activeWorkspaceName}
                  fallback={session.user.activeWorkspaceName}
                />
                {session.user.activeWorkspaceName.length > 19 ? (
                  <span className="text-xs">
                    {session.user.activeWorkspaceName}
                  </span>
                ) : (
                  session.user.activeWorkspaceName
                )}
              </>
            )}
          </Link>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              role="combobox"
              aria-expanded={open}
              aria-label="Select a workspace"
              disabled={isPending}
              className="w-8"
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup>
                {data.map((ws) => (
                  <CommandItem
                    key={ws.name}
                    value={ws.name + ws.id} //
                    onSelect={async () => {
                      setOpen(false);
                      await switchActiveWorkspace({
                        workspaceId: ws.id,
                      });
                      void utils.workspace.getAllForLoggedUser.invalidate();

                      router.refresh();
                    }}
                    className="text-sm"
                  >
                    <AvatarWrapper
                      className="mr-2 h-5 w-5"
                      src={`${getBaseUrl()}/api/avatar/${ws.name}`}
                      alt={ws.name}
                    />
                    {ws.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        session.user.activeWorkspaceId === ws.id
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      setShowNewWorkspaceDialog(true);
                    }}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create Workspace
                  </CommandItem>
                </DialogTrigger>
                <CommandItem
                  onSelect={() => {
                    router.push("/workspace/settings");
                    setOpen(false);
                  }}
                >
                  <Settings className="mr-2 h-5 w-5" />
                  Workspace Settings
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </AddWorkspaceDialog>
  );
}
