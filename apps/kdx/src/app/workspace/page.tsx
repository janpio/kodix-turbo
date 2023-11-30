import { redirect } from "next/navigation";

import { getBaseUrl } from "@kdx/api/src/shared";
import { auth } from "@kdx/auth";
import { AvatarWrapper } from "@kdx/ui";

import { api } from "~/trpc/server";
import { KodixApp } from "../_components/app/kodix-app";
import { GradientHero } from "../_components/gradient-hero";

export default async function Workspace() {
  const session = await auth();
  if (!session) return redirect("/");
  const apps = await api.app.getInstalled.query();

  return (
    <div className="h-144 flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <div className="text-center">
        <p className="font-italic italic">You are on</p>
        <div className="flex">
          <AvatarWrapper
            className="mr-2 h-5 w-5"
            src={`${getBaseUrl()}/api/avatar/${
              session.user.activeWorkspaceName
            }`}
            alt={session.user.activeWorkspaceName}
            fallback={session.user.activeWorkspaceName}
          />
          <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text font-bold">
            {session.user.activeWorkspaceName}
          </span>
        </div>
      </div>
      <div className="flex flex-row space-x-4">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id}
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={true}
              session={session}
            />
          </div>
        ))}
      </div>

      <GradientHero />
    </div>
  );
}
