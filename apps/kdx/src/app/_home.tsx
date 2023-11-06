"use client";

import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

import type { RouterOutputs } from "@kdx/api";
import { Avatar, AvatarFallback, AvatarImage } from "@kdx/ui";

import { api } from "~/trpc/react";

export function HomePage(props: {
  initialData: RouterOutputs["workspace"]["getActiveWorkspace"] | undefined;
}) {
  const sessionData = useSession();

  const { data: workspace } = api.workspace.getActiveWorkspace.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      enabled: sessionData.data?.user !== undefined,
      initialData: props.initialData,
    },
  );
  const { theme } = useTheme();

  return (
    <div className="h-144 flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="text-primary scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-8xl">
        Welcome to Kodix
      </h1>
      {sessionData.data && (
        <div className=" text-2xl">
          <p>Workspace:</p>
          <div className="text-bold text-primary inline-flex h-[40px] items-center">
            <Avatar className="my-auto mr-2 h-5 w-5">
              <AvatarImage
                src={`https://avatar.vercel.sh/${sessionData.data.user.id}kdx.png`}
                alt={workspace?.name}
              />
              <AvatarFallback>
                {workspace?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="">{workspace?.name}</span>
          </div>
        </div>
      )}
      {theme === "light" ? (
        <div className="bg-foreground absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
      ) : (
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
      )}
    </div>
  );
}
