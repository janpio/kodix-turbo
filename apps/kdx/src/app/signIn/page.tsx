import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { _SignIn } from "./_sign-in";

export default async function SignIn() {
  const session = await auth();
  if (session) return redirect("/");
  return <_SignIn />;
}
