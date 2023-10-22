"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Loader2, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";

import type { Workspace as PrismaWorkspace } from "@kdx/db";
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

type Workspace = Pick<PrismaWorkspace, "id" | "name">;

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const { data: session } = useSession();

  const [selectedWS, setSelectedWS] = React.useState<Workspace>({
    id: session?.user?.activeWorkspaceId ?? "",
    name: "",
  });

  const router = useRouter();
  const utils = api.useUtils();
  const { mutate } = api.user.switchActiveWorkspace.useMutation({
    onSuccess: () => {
      void utils.workspace.getActiveWorkspace.invalidate();
      router.refresh();
    },
  });

  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
      onSuccess: (workspace) => {
        const newSelectedWS = workspace.find((ws) => ws.id === selectedWS.id);
        if (newSelectedWS === undefined) return;
        setSelectedWS({
          id: newSelectedWS.id,
          name: newSelectedWS.name,
        });
      },
      refetchOnWindowFocus: false,
    },
  );

  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] =
    React.useState(false);
  const [reloading, setReloading] = React.useState(false);

  return (
    <AddWorkspaceDialog
      open={showNewWorkspaceDialog}
      onOpenChange={setShowNewWorkspaceDialog}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <div className="center border-border flex justify-center rounded-lg border">
          <Link
            href={reloading ? "#" : `/workspace/${selectedWS.name}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-[175px] justify-start",
              className,
            )}
          >
            {reloading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <Skeleton className="mx-3 h-3 w-full" />
              </>
            ) : (
              <>
                <Avatar className="mr-2 h-5 w-5">
                  <AvatarImage
                    src={`https://avatar.vercel.sh/${selectedWS.id}kdx.png`}
                    alt={selectedWS.name}
                  />
                  <AvatarFallback>
                    {selectedWS.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {selectedWS.name.length > 19 ? (
                  <span className="text-xs">{selectedWS.name}</span>
                ) : (
                  selectedWS.name
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
              disabled={reloading}
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
                {workspaces?.map((ws) => (
                  <CommandItem
                    key={ws.name}
                    value={ws.name + ws.id} //
                    onSelect={(value) => {
                      setSelectedWS({
                        id: ws.id,
                        name: ws.name,
                      });
                      setOpen(false);
                      value !== selectedWS.id
                        ? void mutate({ workspaceId: ws.id })
                        : null;
                      setReloading(true);
                    }}
                    className="text-sm"
                  >
                    <Avatar className="mr-2 h-5 w-5">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${ws.id}kdx.png`}
                        alt={ws.name}
                      />
                      <AvatarFallback>
                        {session?.user.name
                          ? session?.user?.name
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
                        selectedWS.id === ws.id ? "opacity-100" : "opacity-0",
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
