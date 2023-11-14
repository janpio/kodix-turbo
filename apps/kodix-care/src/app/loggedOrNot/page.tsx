"use client";

import { Button } from "@kdx/ui";

import { signIn } from "~/app/_components/providers";

export default function LoggedOrNot() {
  return (
    <div>
      {/* <Button onClick={() => void signOut()}>Log Out</Button> */}
      <Button onClick={() => void signIn()}>Sign in</Button>
    </div>
  );
}
