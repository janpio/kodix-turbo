"use client";

import type { KeyboardEventHandler } from "react";
import { useEffect, useState } from "react";
import {
  CornerRightUp,
  Pencil,
  Plus,
  PlusIcon,
  SendIcon,
  Trash2,
} from "lucide-react";

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
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const totalTagChars = 0;

  function handleAddTag() {
    if (tagInput.trim().length === 0) return;
    setTags([...tags, tagInput]);
    setTagInput("");
  }
  //Add tag when enter is pressed
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAddTag();
  }

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
            <Button className="text-sm font-thin" disabled={!(tags.length > 0)}>
              <SendIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mb-6 flex flex-row space-x-3 p-4">
          <Input
            type="text"
            className="text-md"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e)}
          ></Input>
          <Button
            variant={"secondary"}
            disabled={tagInput.trim().length === 0}
            onClick={handleAddTag}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="bg-muted h-full w-full"></div>
    </main>
  );
}
