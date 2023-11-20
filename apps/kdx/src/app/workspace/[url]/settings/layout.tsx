import { notFound, redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import { Navigation } from "../../../_components/navigation";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function Layout({
  params,
  children,
}: {
  params: { url: string };
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/signin");
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

  if (!searchedWs || !workspaceIsFromUser) notFound();

  const searchedWorkspaceIsActiveWs =
    searchedWs?.id === session?.user.activeWorkspaceId;

  if (!searchedWorkspaceIsActiveWs) {
    await api.user.switchActiveWorkspace.mutate({
      workspaceId: searchedWs?.id,
    });
  }

  const navItems = [
    {
      href: `/workspace/${params.url}/settings/general`,
      title: "General",
    },
    {
      href: `/workspace/${params.url}/settings/members`,
      title: "Members",
    },
  ];

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center border-b pb-8">
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>
      <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
        <Navigation
          items={navItems}
          goBackItem={{
            title: "Settings",
            href: `/workspace/${params.url}/settings`,
          }}
        />
        <ShouldRender>{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
