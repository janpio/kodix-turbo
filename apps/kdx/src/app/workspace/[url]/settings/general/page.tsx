import { Suspense } from "react";

import { EditWorkspaceNameCard } from "./_components/edit-workspace-name-card";
import SettingsEditCardSkeleton from "./_components/edit-workspace-name-card-skeleton";
import { EditWorkspaceUrlCard } from "./_components/edit-workspace-url-card";

export default function GeneralSettings({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: {
  params: { url: string };
}) {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWorkspaceNameCard />
      </Suspense>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWorkspaceUrlCard />
      </Suspense>
    </div>
  );
}
