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
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<EditWorkspaceNameCardSkeleton />}>
        <EditWorkspaceNameCard />
      </Suspense>
      <Suspense fallback={<EditWorkspaceNameCardSkeleton />}>
        <EditWorkspaceUrlCard />
      </Suspense>
    </div>
  );
}
