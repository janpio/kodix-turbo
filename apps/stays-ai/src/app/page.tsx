import { CornerRightUp, Plus } from "lucide-react";

import { Button, Input } from "@kdx/ui";

import Chat from "~/components/Chat";

export default function Page() {
  return (
    <main className="bg-muted h-screen">
      <div className="bg-background shadow-foreground fixed bottom-0 z-40 flex h-40 w-full flex-col transition-transform">
        <div className="flex h-32 flex-row justify-end p-4">
          <Button className="text-sm font-thin" disabled>
            <CornerRightUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-row space-x-3 p-4 pb-6">
          <Input type="text" className=""></Input>
          <Button variant={"secondary"}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </main>
  );
}
