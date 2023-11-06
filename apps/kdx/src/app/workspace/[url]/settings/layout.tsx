import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { cn } from "@kdx/ui";

import MaxWidthWrapper from "~/components/max-width-wrapper";
import { api } from "~/trpc/server";
import { SettingsNav } from "./_components/settings-nav";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function Layout({
  params,
  children,
}: {
  params: { url: string };
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/signIn");
  const searchedWs = await prisma.workspace.findFirst({
    where: {
      url: params.url,
    },
    select: {
      id: true,
      url: true,
      users: {
        where: {
          id: session?.user.id,
        },
        select: {
          workspaces: {
            select: {
              url: true,
            },
          },
        },
      },
    },
  });

  const workspaceIsFromUser = searchedWs?.users[0]?.workspaces.some(
    (x) => x.url === params.url,
  );

  if (!searchedWs || !workspaceIsFromUser)
    //Workspace is not from user, or workspace does not exist
    notFound();

  const searchedWorkspaceIsActiveWs =
    searchedWs?.id === session?.user.activeWorkspaceId;

  if (!searchedWorkspaceIsActiveWs) {
    await api.user.switchActiveWorkspace.mutate({
      workspaceId: searchedWs?.id,
    });
  }

  return (
    <MaxWidthWrapper>
      <div className="h-28">
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>
      <div className="flex flex-row">
        <SettingsNav url={params.url} />
        <ShouldRender>
          <div className={cn("w-full text-center md:block")}>{children}</div>
        </ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
