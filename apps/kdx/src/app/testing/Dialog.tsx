"use client";

import React from "react";

import { Button } from "@kdx/ui";

import { DialogContext } from "./Contexts/DialogContexts";

export function Dialog() {
  const { open, toggle } = React.useContext(DialogContext);
  return (
    <>
      <Button onClick={toggle}>Toggle!</Button>
      {open && <div className="h-10 w-60 bg-red-200"></div>}
    </>
  );
}
