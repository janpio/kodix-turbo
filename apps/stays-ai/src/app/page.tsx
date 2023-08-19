"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "ai/react";
import { AiOutlineClear } from "react-icons/ai";
import { BsSlashLg } from "react-icons/bs";
import {
  LuArrowDown,
  LuLoader2,
  LuPlus,
  LuSend,
  LuUser,
  LuX,
} from "react-icons/lu";

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
  toast,
} from "@kdx/ui";

import { Slash, StaysIcon, StaysLogo } from "~/components/SVGs";

export default function Page() {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

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
        : window.location.origin.replace("3001", "3000")
    }/api/ai`,
    onError: (err) => {
      setLoading(false);
      toast({
        variant: "destructive",
        title: `Aconteceu um erro!`,
        description: `Por favor, tente novamente mais tarde`,
      });
    },
    onFinish: () => {
      setLoading(false);
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    },
  });

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    setLoading(true);

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
    setMessages([
      {
        id: "1",
        content:
          "Olá, eu sou o assistente virtual da Kodix, como posso te ajudar?",
        role: "assistant",
      },
      {
        id: "2",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "3",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "4",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "5",
        content:
          "Olá, eu sou o assistente virtual da Kodix, como posso te ajudar?",
        role: "assistant",
      },
      {
        id: "6",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "7",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "8",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "9",
        content:
          "Olá, eu sou o assistente virtual da Kodix, como posso te ajudar?",
        role: "assistant",
      },
      {
        id: "10",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "11",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "12",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "13",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "14",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "15",
        content:
          "Olá, eu sou o assistente virtual da Kodix, como posso te ajudar?",
        role: "assistant",
      },
      {
        id: "16",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "17",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "18",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "19",
        content:
          "Olá, eu sou o assistente virtual da Kodix, como posso te ajudar?",
        role: "assistant",
      },
      {
        id: "20",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
      {
        id: "30",
        content: "Voce pode comer banana muitlo legal?",
        role: "assistant",
      },
      {
        id: "31",
        content: "Como posso melhorar a divulgação do meu anúncio?",
        role: "user",
      },
    ]);
  }, [setMessages]);

  useEffect(() => {
    setInput(tags.join(","));
  }, [setInput, tags]);

  return (
    <main className="flex flex-col sm:flex-row">
      {messages.length ? (
        <>
          <ClearChat
            onClick={() => {
              setMessages([]);
            }}
          />
          <ScrollDownButton
            onClick={() => {
              lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </>
      ) : null}
      <div className="bg-background fixed bottom-0 left-0 z-50 w-full rounded-md border shadow-md sm:relative sm:w-[700px] sm:p-8">
        <div className="hidden sm:block">
          <Link target="_blank" href="https://www.stays.net">
            <StaysLogo className="h-10 w-40" />
          </Link>
        </div>
        <div className="bg-red-200">
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
                disabled={tagInput.trim().length === 0 || loading}
                onClick={handleAddTag}
              >
                <LuPlus className="h-4 w-4" />
              </Button>
            ) : (
              <form onSubmit={handleSend} className="m-0 p-0">
                <Dialog open={open} onOpenChange={setOpen}>
                  <Button
                    disabled={!(tags.length > 0) || loading}
                    type="submit"
                    ref={submitButtonRef}
                  >
                    {loading ? (
                      <LuLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LuSend className="h-4 w-4" />
                    )}
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
      </div>
      <ScrollArea className="h-screen w-full">
        {messages.map((message, i) => (
          <div
            ref={messages.length - 1 === i ? lastMessageRef : null}
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
        <div className="h-[250px] sm:hidden md:h-48"></div>
      </ScrollArea>
    </main>
  );
}

//function BreadCrumbs() {
//  return (
//    <ol className="flex">
//      <li>
//        <Link target="_blank" href="https://www.stays.net">
//          <StaysLogo className="h-10 w-40" />
//        </Link>
//      </li>
//      <li className="flex items-center">
//        <BsSlashLg className="text-foreground/20 h-7 w-7 -rotate-12" />
//      </li>
//      <li className="flex items-center">
//        <span className="text-2xl font-bold">IA</span>
//      </li>
//    </ol>
//  );
//}

function ScrollDownButton({ onClick }: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-foreground/80 absolute bottom-0 right-0 z-50 m-4 rounded-full",
      )}
      onClick={onClick}
    >
      <LuArrowDown className="h-4 w-4" />
    </Button>
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
