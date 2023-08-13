"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { PlusIcon, SendIcon, User, X } from "lucide-react";

import {
  Avatar,
  Badge,
  badgeVariants,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@kdx/ui";

import { StaysIcon } from "~/components/SVGs";

// ... (import statements)

export default function Page() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  function handleAddTag() {
    if (tagInput.trim().length === 0) return;
    setTags([...tags, tagInput]);
    setTagInput("");
  }

  function handleDeleteTag(tagToDelete: number) {
    setTags(tags.filter((_, i) => i !== tagToDelete));
  }

  // Add tag when enter is pressed
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAddTag();
  }

  const { messages, setInput, handleSubmit } = useChat({
    api: `${
      process.env.NODE_ENV === "production"
        ? "https://www.kodix.com.br"
        : "http://localhost:3000"
    }/api/ai`,
  });

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const storage = JSON.parse(localStorage.getItem("_reg") ?? "{}") as _reg;
    if (!storage.hasRegged) {
      setOpen(true);
      return;
    }
    //alert("Submit");
    handleSubmit(e);
    setInput("");
  }

  useEffect(() => {
    setInput(tags.join(","));
  }, [setInput, tags]);

  return (
    <main className="h-screen">
      <div className="bg-background shadow-foreground fixed bottom-0 z-40 flex h-56 w-full flex-col rounded-lg shadow-md transition-transform sm:h-full sm:w-[500px]">
        <div className="flex h-36 p-2 px-4 pb-1">
          <ScrollArea className="mr-4 h-[100px] max-h-fit grow space-x-1 space-y-4 pb-1">
            {tags.map((tag, i) => (
              <TagItem
                key={tag + i}
                tag={tag}
                onTagChange={(newTag) => {
                  const newTags = [...tags];
                  newTags[i] = newTag;
                  setTags(newTags);
                }}
                onDeleteTag={() => handleDeleteTag(i)}
              />
            ))}
          </ScrollArea>
          <div className="flex flex-col justify-start"></div>
        </div>
        <div className="mb-6 flex flex-row space-x-3 p-4">
          <Input
            type="text"
            className="text-md"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => handleInputKeyDown(e)}
          ></Input>
          {tagInput.trim().length > 0 ? (
            <Button
              variant={"outline"}
              disabled={tagInput.trim().length === 0}
              onClick={handleAddTag}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          ) : (
            <form onSubmit={handleSend} className="m-0 p-0">
              <Dialog open={open} onOpenChange={setOpen}>
                <Button
                  disabled={!(tags.length > 0)}
                  type="submit"
                  ref={submitButtonRef}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogDescription>
                      <Form setOpen={setOpen} buttonRef={submitButtonRef} />
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </form>
          )}
        </div>
      </div>
      <div className="bg-muted h-full w-full">
        <ScrollArea className="h-[490px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(message.role === "assistant" && "bg-muted")}
            >
              <div className="mx-6 flex flex-row py-4">
                <Avatar className="h-10 w-10">
                  {message.role === "assistant" ? (
                    <StaysIcon className="h-auto w-auto p-1" />
                  ) : (
                    <User className="h-auto w-auto p-1" />
                  )}
                </Avatar>
                <p className="ml-4 text-sm leading-relaxed">
                  {message.role === "assistant"
                    ? message.content
                    : tags.map((tag) => (
                        <Badge
                          key={tag}
                          className={cn(
                            "text-xs",
                            badgeVariants({ variant: "outline" }),
                          )}
                        >
                          {tag}
                        </Badge>
                      ))}
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>
    </main>
  );
}
interface _reg {
  hasRegged: boolean;
}
function Form({
  setOpen,
  buttonRef,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  buttonRef: React.RefObject<HTMLButtonElement>;
}) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    new window.RDStationForms(
      "ai-1f84733bbb7018305ac8",
      "UA-78082533-1",
    ).createForm();

    function onElementLoaded() {
      const element = document.getElementById("rd-button-lkigu0y4");
      if (element) {
        element.onclick = () => {
          const storage = JSON.parse(
            localStorage.getItem("_reg") ?? "{}",
          ) as _reg;
          storage.hasRegged = true;
          localStorage.setItem("_reg", JSON.stringify(storage));
          setOpen(false);
          if (buttonRef.current) {
            buttonRef.current.click();
          }
        };
      }
    }

    function isElementLoaded() {
      const element = document.getElementById("rd-button-lkigu0y4");
      return !!element;
    }
    const intervalId = setInterval(function () {
      if (isElementLoaded()) {
        clearInterval(intervalId); // Stop the interval
        onElementLoaded(); // Execute the action once the element is loaded
      }
    }, 100);
  }, [buttonRef, setOpen]);

  return <div role="main" id="ai-1f84733bbb7018305ac8"></div>;
}

function TagItem({
  tag,
  onTagChange,
  onDeleteTag,
}: {
  tag: string;
  onTagChange: (newTag: string) => void;
  onDeleteTag: () => void;
}) {
  const [editTagPopoverOpen, setEditTagPopoverOpen] = useState(false);
  const inputRef = useRef(null);

  return (
    <Popover open={editTagPopoverOpen} onOpenChange={setEditTagPopoverOpen}>
      <div className={cn("h-fit", badgeVariants({ variant: "outline" }))}>
        <PopoverTrigger asChild>
          <span>{tag}</span>
        </PopoverTrigger>
        <Button
          onClick={() => onDeleteTag()}
          className={cn("m-0 ml-2 h-2 rounded-full p-0")}
          variant={"link"}
        >
          <X className="text-foreground/40 h-3 w-3" />
        </Button>
      </div>
      <PopoverContent side="top">
        <Input
          ref={inputRef}
          type="text"
          size={2}
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditTagPopoverOpen(!editTagPopoverOpen);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
