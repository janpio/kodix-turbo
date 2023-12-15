import { redirect } from "next/navigation";

import type { KodixApp as KodixAppType } from "@kdx/db";
import { auth } from "@kdx/auth";

import { api } from "~/trpc/server";
import { CustomKodixIcon, IconKodixApp } from "../_components/app/kodix-app";
import MaxWidthWrapper from "../_components/max-width-wrapper";

export default async function Workspace() {
  const session = await auth();
  if (!session) return redirect("/");
  const apps = await api.app.getInstalled.query();

  return (
    <main className="flex-1 py-8">
      <MaxWidthWrapper className="flex flex-col gap-12">
        <div className="flex">
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-4xl font-bold">
            {session.user.activeWorkspaceName}
          </span>
        </div>
        <div className="flex flex-row items-center space-x-10">
          <CustomKodixIcon
            appName={"Marketplace"}
            appUrl={"/marketplace"}
            iconPath={"/appIcons/marketplace.png"}
          />
          <CustomKodixIcon
            appName={"Settings"}
            appUrl={"/workspace/settings"}
            iconPath={"/appIcons/settings.png"}
          />
          {apps?.map((app) => (
            <IconKodixApp
              key={app.id}
              appName={app.name as KodixAppType["name"]}
              appUrl={app.url as KodixAppType["url"]}
            />
          ))}
        </div>
      </MaxWidthWrapper>
    </main>
  );
}
