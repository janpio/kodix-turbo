import { H1, Lead } from "@kdx/ui";

import { KodixApp } from "~/components/app/kodix-app";
import { createCaller } from "~/trpc/server";

export default async function Apps() {
  const caller = await createCaller();
  const apps = await caller.app.getAll();

  return (
    <div className="p-4">
      <H1>Marketplace</H1>
      <Lead className="mt-2">
        Take a look at all available apps, and install them
      </Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {apps?.map((app) => (
          <div key={app.id}>
            <KodixApp
              id={app.id}
              appName={app.name}
              appDescription={app.description}
              appUrl={app.urlApp}
              installed={app.installed}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
