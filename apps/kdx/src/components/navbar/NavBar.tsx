"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";

import {
  Button,
  buttonVariants,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kdx/ui";

import { api } from "~/trpc/react";

const callsToActionProfilePic = [
  //{ name: 'Settings', href: '#', icon: Cog6ToothIcon },
  { name: "Log Out", href: "#", icon: HiArrowLeftOnRectangle },
];

export function NavBar() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-center justify-between py-6 md:justify-start md:space-x-10">
        <div className="flex justify-start lg:w-0 lg:flex-1">
          <Link href="/">
            <span className="sr-only">Your Company</span>
            <h3 className="text-lg text-blue-500">Kodix</h3>
          </Link>
        </div>

        <Link
          href="/marketplace"
          className="text-base font-medium text-gray-200 hover:text-gray-300"
        >
          Marketplace
        </Link>
        {!!session && (
          <Link
            href="/apps"
            className="text-base font-medium text-gray-200 hover:text-gray-300"
          >
            Apps
          </Link>
        )}
        <LoginOrUserProfile />
      </div>
    </div>
  );
}

function LoginOrUserProfile() {
  const { data: session } = useSession();
  const { data: workspaces } = api.workspace.getAllForLoggedUser.useQuery(
    undefined,
    {
      enabled: session?.user !== undefined,
    },
  );

  const ctx = api.useUtils();
  const { mutateAsync } = api.user.switchActiveWorkspace.useMutation({
    onSuccess: () => {
      void ctx.workspace.getAllForLoggedUser.invalidate();
    },
  });
  const [open, setOpen] = useState(false);

  return (
    <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
      {!!session?.user?.id && (
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <>
              <PopoverTrigger>
                <Button
                  className={cn(
                    open ? "text-gray-900" : "text-gray-500",
                    "group inline-flex items-center rounded-md bg-gray-800 text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                  )}
                >
                  <div className="bg-azulVioleta w-28 rounded-md bg-gray-600 px-2 py-1">
                    <Image
                      className="h-10 w-10 rounded-full"
                      src={session?.user?.image ?? "/images/avatar.png"}
                      alt="Rounded avatar"
                      width={40}
                      height={40}
                    />
                  </div>
                </Button>
              </PopoverTrigger>

              <PopoverContent className="absolute z-10 ml-4 mt-3 w-72 max-w-sm transform px-2 sm:px-0 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative grid gap-6 bg-gray-800 px-5 py-6 sm:gap-8 sm:p-8">
                    {workspaces?.map((workspace) => (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
                      <div
                        key={workspace.id}
                        role="button"
                        onClick={async () =>
                          await mutateAsync({ workspaceId: workspace.id })
                        }
                      >
                        <p
                          className={cn({
                            "text-white":
                              session.user.activeWorkspaceId === workspace.id,
                            "text-gray-400":
                              session.user.activeWorkspaceId !== workspace.id,
                          })}
                        >
                          {workspace.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-6 bg-gray-700 px-5 py-5 sm:flex sm:space-x-10 sm:space-y-0 sm:px-8">
                    {callsToActionProfilePic.map((item) => (
                      <div key={item.name} className="flow-root">
                        <Button
                          variant="default"
                          onClick={() => void signOut()}
                        >
                          <item.icon
                            className="text-primary-foreground h-6 w-6 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="ml-3 text-white">{item.name}</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </>
          </Popover>
        </div>
      )}
      {!session?.user.id && (
        <div>
          <Link
            href="/signIn"
            className={buttonVariants({ variant: "default" })}
          >
            Sign in
          </Link>

          <Link
            href="/signIn"
            className={buttonVariants({ variant: "secondary" })}
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
