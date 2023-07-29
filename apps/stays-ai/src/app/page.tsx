"use client";

import { useState } from "react";
import { CornerRightUp, Plus } from "lucide-react";

import { Badge, Button, Input } from "@kdx/ui";

import Chat from "~/components/Chat";

export default function Page() {
  const [tags, setTags] = useState<string[]>([
    "test",
    "test2",
    "test2",
    "asd",
    "wefgwe",
    "test2",
    "test2",
    "test",
    "test2",
    "wefgwe",
  ]);

  return (
    <main className="bg-muted h-screen">
      <div className="bg-background shadow-foreground fixed bottom-0 z-40 flex h-40 w-full flex-col shadow-md transition-transform">
        <div className="flex h-32 flex-row p-4">
          <div className="space-x-1 space-y-1">
            {tags.map((tag, i) => (
              <Badge key={i} className="h-6" variant={"outline"}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-col justify-center">
            <Button className="text-sm font-thin" disabled>
              <CornerRightUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-row space-x-3 p-4">
          <Input type="text" className="text-md"></Input>
          {/* <Button variant={"secondary"}>
            <Plus className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
    </main>
  );
}
