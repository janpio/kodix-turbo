import EditWorkspaceNameCard from "./_components/edit-workspace-name-card";

export default function GeneralSettings({
  params,
}: {
  params: { url: string };
}) {
  return (
    <div>
      <EditWorkspaceNameCard />
    </div>
  );
}
