"use client";

import * as React from "react";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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

type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

type TeamSwitcherProps = PopoverTriggerProps;

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const session = useSession();

  const utils = api.useUtils();
  const {
    isPending,
    mutate: switchActiveWorkspace,
    isSuccess,
  } = api.user.switchActiveWorkspace.useMutation();

  if (isSuccess) utils.workspace.getAllForLoggedUser.invalidate();

  const { data } = api.workspace.getAllForLoggedUser.useQuery();

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);

  if (!session.data) return null;
  if (!data) return null;

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="center border-border flex justify-center rounded-lg border">
          <Link
            href={isPending ? "#" : `/workspace/${data?.activeWorkspaceName}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-[175px] justify-start",
              className,
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <Skeleton className="mx-3 h-3 w-full" />
              </>
            ) : (
              <>
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${data?.activeWorkspaceId}kdx.png`}
                    alt={data?.activeWorkspaceName}
                  />
                  <AvatarFallback>
                    {data?.activeWorkspaceName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {data?.activeWorkspaceName.length > 19 ? (
                  <span className="text-xs">{data?.activeWorkspaceName}</span>
                ) : (
                  data?.activeWorkspaceName
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
            >
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
        </div>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search team..." />
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup>
                {data.workspaces.map((ws) => (
                  <CommandItem
                    key={ws.name}
                    value={ws.name + ws.id} //
                    onSelect={() => {
                      setOpen(false);
                      void switchActiveWorkspace({ workspaceId: ws.id });
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${ws.id}kdx.png`}
                        alt={ws.name}
                      />
                      <AvatarFallback>
                        {ws.name
                          ? ws?.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          : ""}
                      </AvatarFallback>
                    </Avatar>
                    {ws.name}
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        data?.activeWorkspaceId === ws.id
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
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </AddWorkspaceDialog>
  );
}
