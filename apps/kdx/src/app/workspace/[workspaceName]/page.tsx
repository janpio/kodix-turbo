import { H1 } from "@kdx/ui";

export default function Workspace({
  params,
}: {
  params: { workspaceName: string };
}) {
  return <H1 className="p-4">Workspace: {params.workspaceName}</H1>;
}
