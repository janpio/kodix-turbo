"use client";

import { useState } from "react";
import { CornerRightUp, Pencil, Plus, Trash2 } from "lucide-react";

import {
  Badge,
  badgeVariants,
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  ScrollBar,
} from "@kdx/ui";

import Chat from "~/components/Chat";

export default function Page() {
  const [tags, setTags] = useState<string[]>(["test", "test2"]);
  const [tagInput, setTagInput] = useState("");
  const totalTagChars = 0;
  return (
    <main className="h-screen">
      <div className="bg-background shadow-foreground fixed bottom-0 z-40 flex h-56 w-full flex-col shadow-md transition-transform">
        <div className="flex h-36 flex-row p-3">
          <ScrollArea
            className="max-h-20 grow flex-row space-x-1 space-y-2 py-1 pr-2"
            dir="ltr"
          >
            {tags.map((tag, i) => {
              //totalTagChars += tag.length;
              if (totalTagChars < 100)
                return (
                  <DropdownMenu key={i}>
                    <DropdownMenuTrigger asChild>
                      <div
                        key={i}
                        className={cn(
                          badgeVariants({ variant: "outline" }),
                          "h-6",
                        )}
                      >
                        {tag}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[20px]" side="top">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Trash2 className="text-destructive mr-2 h-4 w-4" />
                        Apagar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
            })}
          </ScrollArea>
          <div className="flex flex-col justify-center">
            <Button className="text-sm font-thin" disabled>
              <CornerRightUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mb-6 flex flex-row space-x-3 p-4">
          <Input
            type="text"
            className="text-md"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          ></Input>
          <Button
            variant={"secondary"}
            disabled={tagInput.trim().length === 0}
            onClick={() => {
              setTags([...tags, tagInput]);
              setTagInput("");
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-muted h-full w-full"></div>
    </main>
  );
}
