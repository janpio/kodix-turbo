import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { Navigation } from "~/app/[lang]/_components/navigation";
import { ShouldRender } from "./general/_components/client-should-render";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) return redirect("/signin");

  const navItems = [
    {
      href: `/team/settings/apps`,
      title: `Apps`,
    },
    {
      href: `/team/settings/general`,
      title: "General",
    },
    {
      href: `/team/settings/members`,
      title: "Members",
    },
  ];

  return (
    <MaxWidthWrapper>
      <div className="flex flex-col justify-center space-y-2 border-b pb-8">
        <h1 className="text-4xl font-bold">Team Settings</h1>
        <div className="flex items-center">
          <ChevronRight />
          <p className="text-muted-foreground text-2xl">
            {session.user.activeTeamName}
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col md:flex-row md:space-x-6">
        <Navigation
          items={navItems}
          goBackItem={{
            title: "Settings",
            href: `/team/settings`,
          }}
        />
        <ShouldRender endsWith="/settings">{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
