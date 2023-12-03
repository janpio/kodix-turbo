"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";

import type { Session } from "@kdx/auth";
import {
  Button,
  buttonVariants,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";

export function KodixApp({
  id,
  appName,
  appDescription,
  appUrl,
  installed,
  session,
}: {
  id: string;
  appName: string;
  appDescription: string;
  appUrl: string;
  installed: boolean;
  session: Session | null;
}) {
  const [open, onOpenChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const utils = api.useUtils();
  const { mutate } = api.workspace.installApp.useMutation({
    onSuccess: () => {
      void utils.app.getAll.invalidate();
      router.refresh();
      toast(`App ${appName} installed`);
    },
  });
  const { mutate: uninstall } = api.workspace.uninstallApp.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      void utils.app.getAll.invalidate();
      setLoading(false);
      router.refresh();
      toast(`App ${appName} uninstalled`);
    },
  });

  const isActive = !["null"].includes(appName);

  return (
    <>
      <Card className="w-[250px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="">{appName} </CardTitle>

          {installed && (
            <Dialog open={open} onOpenChange={onOpenChange}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open dialog</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DialogTrigger asChild>
                    <DropdownMenuItem>
                      <Trash2 className="text-destructive mr-2 h-4 w-4" />

                      <span>Uninstall from workspace</span>
                    </DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm</DialogTitle>
                  <DialogDescription className="py-4">
                    Are you sure you would like to uninstall {appName} from
                    {" " + session?.user.activeWorkspaceName}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      void uninstall({ appId: id });
                      setLoading(true);
                    }}
                    variant="destructive"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    )}
                    Uninstall
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <CardDescription className="mb-4">{appDescription}</CardDescription>
          <div className="flex w-full flex-col">
            {session && installed && (
              <Link
                href={`apps${appUrl}`}
                className={cn(
                  buttonVariants({ variant: "default" }),
                  !isActive && "pointer-events-none opacity-50",
                )}
              >
                {isActive ? "Open" : "Coming soon"}
              </Link>
            )}
            {session && !installed && (
              <Button
                onClick={() => void mutate({ appId: id })}
                variant={"secondary"}
                className={cn(
                  "disabled",
                  !isActive && "pointer-events-none opacity-50",
                )}
              >
                {isActive ? "Install" : "Coming soon"}
              </Button>
            )}
            {!session && (
              <Link
                href="/signin"
                className={cn(buttonVariants({ variant: "default" }))}
              >
                Install
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
