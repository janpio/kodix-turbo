import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@kdx/ui";

export default async function EditWorkspaceNameCard() {
  const session = await auth();
  if (!session) return null;
  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: {
      id: session.user.activeWorkspaceId,
    },
    include: {
      users: true,
    },
  });
  return (
    <Card className="w-full text-left">
      <form
        action={async (formdata: FormData) => {
          "use server";

          await prisma.workspace.update({
            where: {
              id: session.user.activeWorkspaceId,
            },
            data: {
              name: formdata.get("name")?.toString(),
            },
          });
        }}
      >
        <CardHeader>
          <CardTitle>Workspace Name</CardTitle>
          <CardDescription>
            This is your workspace&apos;s visible name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={workspace.name} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <p className="">Please use 32 characters at maximum.</p>
          <Button type="submit">Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
