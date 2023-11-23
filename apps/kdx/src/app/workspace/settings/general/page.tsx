import { Suspense } from "react";

import { EditWorkspaceNameCard } from "./_components/edit-workspace-name-card";
import SettingsEditCardSkeleton from "./_components/edit-workspace-name-card-skeleton";

export default function GeneralSettings() {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWorkspaceNameCard />
      </Suspense>
    </div>
  );
}
