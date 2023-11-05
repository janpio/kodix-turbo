import { Suspense } from "react";

import { EditWorkspaceNameCard } from "./_components/edit-workspace-name-card";
import EditWorkspaceNameCardSkeleton from "./_components/edit-workspace-name-card-skeleton";
import { EditWorkspaceUrlCard } from "./_components/edit-workspace-url-card";

export default function GeneralSettings({
  params,
}: {
  params: { url: string };
}) {
  return (
    <div className="space-y-8">
      <Suspense fallback={<EditWorkspaceNameCardSkeleton />}>
        <EditWorkspaceNameCard />
      </Suspense>
      <Suspense fallback={<EditWorkspaceNameCardSkeleton />}>
        <EditWorkspaceUrlCard />
      </Suspense>
    </div>
  );
}
