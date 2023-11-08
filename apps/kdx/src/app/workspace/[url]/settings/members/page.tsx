import { Suspense } from "react";

import SettingsEditCardSkeleton from "../general/_components/edit-workspace-name-card-skeleton";
import { EditWorkspaceMemberCard } from "./_components/edit-workspace-members/edit-workspace-members.card";

export default function Members({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: {
  params: { url: string };
}) {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWorkspaceMemberCard />
      </Suspense>
    </div>
  );
}
