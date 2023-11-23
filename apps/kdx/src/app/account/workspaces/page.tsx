import { Suspense } from "react";

import SettingsEditCardSkeleton from "~/app/workspace/settings/general/_components/edit-workspace-name-card-skeleton";
import { EditUserWorkspacesTable } from "./_components/edit-users-workspaces-card/edit-users-workspaces-table";

export default function Workspaces() {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <div className="flex flex-col space-y-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">
          Workspaces
        </h3>
        <p className="text-muted-foreground text-sm">
          Manage the Workspaces that you&apos;re a part of, or create a new one.
        </p>
      </div>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditUserWorkspacesTable />
      </Suspense>
    </div>
  );
}
