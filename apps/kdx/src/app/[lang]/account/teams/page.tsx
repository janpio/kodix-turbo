import { Suspense } from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { AddTeamDialogButton } from "~/app/[lang]/_components/header/add-team-dialog-button";
import SettingsEditCardSkeleton from "~/app/[lang]/team/settings/general/_components/edit-team-name-card-skeleton";
import { EditUserTeamsTable } from "./_components/edit-users-teams-card/edit-users-teams-table";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function Teams() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <div className="flex flex-col space-y-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Teams
        </h3>
        <div className="flex flex-row">
          <p className="text-muted-foreground pr-8 text-sm">
            Manage the Teams that you&apos;re a part of, or create a new one.
          </p>
          <AddTeamDialogButton session={session} className="ml-auto" />
        </div>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditUserTeamsTable />
      </Suspense>
    </div>
  );
}
