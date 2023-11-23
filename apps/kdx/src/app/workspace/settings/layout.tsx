import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { Navigation } from "../../_components/navigation";
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
      href: `/workspace/settings/general`,
      title: "General",
    },
    {
      href: `/workspace/settings/members`,
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
            href: `/workspace/settings`,
          }}
        />
        <ShouldRender endsWith="/settings">{children}</ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
