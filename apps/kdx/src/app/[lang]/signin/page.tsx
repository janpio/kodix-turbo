import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { _SignIn } from "./_sign-in";

export default async function SignIn({
  searchParams,
}: {
  searchParams?: Record<string, string | undefined>;
}) {
  const session = await auth();
  if (session) return redirect(searchParams?.callbackUrl ?? "/");

  return <_SignIn callbackUrl={searchParams?.callbackUrl} />;
}
