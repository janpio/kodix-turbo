import type { KodixApp as KodixAppType } from "@kdx/db";
import { auth } from "@kdx/auth";
import { H1, Lead } from "@kdx/ui";

import { KodixApp } from "~/app/[lang]/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic"; //TODO: help me

export default async function Apps() {
  const apps = await api.app.getAll.query();
  const session = await auth();

  return (
    <MaxWidthWrapper>
      <H1>Marketplace</H1>
      <Lead className="mt-2">
        Take a look at all available apps, and install them
      </Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id as KodixAppType["id"]}
              installed={app.installed}
              session={session}
            />
          </div>
        ))}
      </div>
    </MaxWidthWrapper>
  );
}
