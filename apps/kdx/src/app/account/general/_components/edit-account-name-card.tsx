import { revalidatePath } from "next/cache";
import { Loader2 } from "lucide-react";

import { auth } from "@kdx/auth";
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

import { api } from "~/trpc/server";

export async function EditAccountNameCard({ name }: { name?: string | null }) {
  const session = await auth();
  if (!session) return null;

  return (
    <form
      action={async (values) => {
        "use server";

        await api.user.changeName.mutate({
          name: values.get("name") as string,
        });
        revalidatePath("/account/general");
      }}
    >
      <Card className="w-full text-left">
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>
            Please enter your full name, or a display name you are comfortable
            with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                required
                id="name"
                name="name"
                maxLength={32}
                defaultValue={name ?? ""}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <p className="">Please use 32 characters at maximum.</p>
          <Button type="submit">
            {false ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
              </>
            ) : (
              <>Save</>
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
