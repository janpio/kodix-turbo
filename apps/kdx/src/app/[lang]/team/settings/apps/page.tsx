import { redirect } from "next/navigation";

import type { KodixApp as KodixAppType } from "@kdx/db";
import { auth } from "@kdx/auth";
import { Lead } from "@kdx/ui";

import { KodixApp } from "~/app/[lang]/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function AppsPage() {
  const session = await auth();
  if (!session) return redirect("/api/auth/signin");
  const apps = await api.app.getInstalled.query();

  return (
    <MaxWidthWrapper>
      <h1 className="text-foreground text-2xl font-bold">
        Your installed apps
      </h1>
      <Lead className="mt-2">These are your installed apps</Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id as KodixAppType["id"]}
              installed={true}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
