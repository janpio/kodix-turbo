"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  buttonVariants,
  Skeleton,
} from "@kdx/ui";

import type { RouterOutputs } from "~/trpc/react";
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

  return (
    <main className="h-144 bg-background flex flex-col items-center justify-center gap-12 px-4 py-16">
      <h1 className="scroll-m-20 text-6xl font-extrabold tracking-tight lg:text-8xl">
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

      <div className="flex flex-col items-center">
        <div className="flex flex-col items-center justify-center gap-4">
          {sessionData.status === "loading" ? (
            <Skeleton className="h-12 w-32" />
          ) : (
            <Link
              href={sessionData.data ? "" : "/signIn"}
              onClick={sessionData.data ? () => void signOut() : () => null}
              className={buttonVariants({ variant: "default", size: "lg" })}
            >
              {sessionData.data ? "Sign out" : "Sign in"}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
