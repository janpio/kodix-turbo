import { Suspense } from "react";

import SettingsEditCardSkeleton from "../general/_components/edit-workspace-name-card-skeleton";
import { EditWSMembersAndInvitesCard } from "./_components/edit-workspace-members/edit-ws-members-and-invites-card";
import WorkspaceInviteCard from "./_components/invite/workspace-invite-card";

export default function Members() {
  return (
    <div className="mt-8 space-y-8 md:mt-0">
      <WorkspaceInviteCard />
      <Suspense fallback={<SettingsEditCardSkeleton />}>
        <EditWSMembersAndInvitesCard />
      </Suspense>
    </div>
  );
}
