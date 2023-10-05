import { Suspense } from "react";
import { redirect } from "next/navigation";

import { H1, Lead, Skeleton } from "@kdx/ui";

import { KodixApp } from "~/components/app/kodix-app";
import { api } from "~/trpc/server";

export default function Apps() {
  return (
    <div className="p-4">
      <H1>Your installed apps</H1>
      <Lead className="mt-2">These are your installed apps</Lead>
      <br />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense
          fallback={new Array(2).fill(Math.random()).map((p: number) => (
            <Skeleton key={p} className="h-36 max-w-sm" />
          ))}
        >
          <AppsSection />
        </Suspense>
      </div>
    </div>
  );
}

async function AppsSection() {
  const apps = await api.app.getInstalled.query();

  return (
    <>
      {apps?.map((app) => (
        <div key={app.id}>
          <KodixApp
            id={app.id}
            appName={app.name}
            appDescription={app.description}
            appUrl={app.urlApp}
            installed={true}
          />
        </div>
      ))}
    </>
  );
}
