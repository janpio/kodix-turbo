import { Suspense } from "react";

import SettingsEditCardSkeleton from "../general/_components/edit-workspace-name-card-skeleton";
import { EditWorkspaceMemberCard } from "./_components/edit-workspace-members/edit-workspace-members.table";
import WorkspaceInviteCard from "./_components/workspace-invite/workspace-invite-card";

export default function Members({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: {
  params: { url: string };
}) {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <WorkspaceInviteCard />
      </Suspense>
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWorkspaceMemberCard />
      </Suspense>
    </div>
  );
}
