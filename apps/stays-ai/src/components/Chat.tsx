"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "ai/react";
import { User } from "lucide-react";

import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  ScrollArea,
  Textarea,
} from "@kdx/ui";

import { StaysIcon, StaysLogo } from "./SVGs/index";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    RDStationForms: any;
  }
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

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setInput } =
    useChat({
      api: `${
        process.env.NODE_ENV === "production"
          ? "https://www.kodix.com.br"
          : "http://localhost:3000"
      }/api/ai`,
    });
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const messageExamples = [
    "Faça a descrição de um apartamento de dois quartos em Ipanema para o Airbnb",
    "Como chamar mais atenção para meu anúncio?",
    "Como posso melhorar a divulgação do meu anúncio",
  ];
  const [open, setOpen] = useState(false);

  function submitForm(e: React.FormEvent<HTMLFormElement>) {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="w-[800px]">
        <CardHeader className="shadow">
          <CardTitle>
            <Link target="_blank" href="https://www.stays.net">
              <StaysLogo className="h-10 w-40" />
            </Link>
          </CardTitle>
          <CardDescription className="text-md">
            Assistente para aluguéis de temporada
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid w-full items-center gap-4">
            <ScrollArea className="h-[490px]">
              <div className="">
                {messages.length === 0 && (
                  <div className="mx-8 mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {messageExamples.map((message, i) => (
                      <Button
                        key={i}
                        className="h-32"
                        onClick={() => {
                          setInput(message);
                        }}
                        variant={"outline"}
                      >
                        <p className="text-center text-sm italic">
                          &quot;{message}&quot;
                        </p>
                      </Button>
                    ))}
                  </div>
                )}
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
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
        <CardFooter className="mt-4 flex justify-between space-x-2">
          <form onSubmit={submitForm} className="flex w-full gap-2">
            <Textarea
              placeholder="Gere um título..."
              onChange={handleInputChange}
              value={input}
            ></Textarea>
            <Button
              variant="default"
              type="submit"
              ref={submitButtonRef}
              disabled={input == ""}
            >
              Enviar
            </Button>
          </form>
        </CardFooter>
      </Card>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>
            <Form setOpen={setOpen} buttonRef={submitButtonRef} />
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
