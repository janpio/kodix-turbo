"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { AiOutlineClear } from "react-icons/ai";
import { LuPlus, LuSend, LuUser, LuX } from "react-icons/lu";

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

  function handleTagChange(index: number, newTag: string) {
    const newTags = [...tags];
    newTags[index] = newTag;
    setTags(newTags);
  }

  // Add tag when enter is pressed
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") handleAddTag();
  }

  const { messages, setInput, handleSubmit, setMessages } = useChat({
    api: `${
      process.env.NODE_ENV === "production"
        ? "https://www.kodix.com.br"
        : "http://localhost:3000"
    }/api/ai`,
  });

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const storage = localStorage.getItem("_reg");
    if (!storage) {
      setOpen(true);
      return;
    }
    handleSubmit(e);
    setInput("");
  }

  useEffect(() => {
    setInput(tags.join(","));
  }, [setInput, tags]);

  return (
    <main className="flex h-screen flex-col">
      {messages.length ? (
        <ClearChat
          onClick={() => {
            setMessages([]);
          }}
        />
      ) : null}
      <ScrollArea className="flex-grow">
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
                  <LuUser className="h-auto w-auto p-1" />
                )}
              </Avatar>
              <div className="ml-4 text-sm leading-relaxed">
                {message.role === "assistant" ? (
                  <p>{message.content}</p>
                ) : (
                  message.content.split(",").map((tag, i) => (
                    <Badge
                      key={message.id + i}
                      className={cn("text-xs")}
                      variant={"outline"}
                    >
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <div className="bg-background shadow-foreground bottom-0 h-56 w-full rounded-xl shadow-md transition-transform sm:w-[500px]">
        <ScrollArea className="h-36 space-x-1 space-y-4 p-4 pt-0">
          {tags.map((tag, i) => (
            <TagItem
              key={i}
              tag={tag}
              onTagChange={(newTag) => handleTagChange(i, newTag)}
              onDeleteTag={() => handleDeleteTag(i)}
            />
          ))}
        </ScrollArea>
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
              <LuPlus className="h-4 w-4" />
            </Button>
          ) : (
            <form onSubmit={handleSend} className="m-0 p-0">
              <Dialog open={open} onOpenChange={setOpen}>
                <Button
                  disabled={!(tags.length > 0)}
                  type="submit"
                  ref={submitButtonRef}
                >
                  <LuSend className="h-4 w-4" />
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
    </main>
  );
}

function ClearChat({ onClick }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={
        "bg-foreground/80 absolute right-0 top-0 z-50 m-4 rounded-full"
      }
      onClick={onClick}
    >
      <AiOutlineClear className="h-4 w-4 rotate-45" />
    </Button>
  );
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
        element.onclick = async () => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const nomeInput = document.getElementById(
            "rd-text_field-lkigufzg",
          ) as HTMLInputElement;
          const emailInput = document.getElementById(
            "rd-email_field-lkigufzh",
          ) as HTMLInputElement;

          if (
            nomeInput.classList.contains("error") ||
            emailInput.classList.contains("error")
          )
            return;

          localStorage.setItem("_reg", "1");
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
          <LuX className="text-foreground/40 h-3 w-3" />
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
