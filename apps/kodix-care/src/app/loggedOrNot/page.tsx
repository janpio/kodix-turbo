"use client";

import { signIn } from "@/components/providers";

import { Button } from "@kdx/ui";

export default function LoggedOrNot() {
  return (
    <div>
      {/* <Button onClick={() => void signOut()}>Log Out</Button> */}
      <Button onClick={() => void signIn()}>Sign in</Button>
    </div>
  );
}
