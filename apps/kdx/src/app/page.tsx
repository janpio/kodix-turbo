import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import { GradientHero } from "./_components/gradient-hero";

export default async function Home() {
  const session = await auth();
  if (session) return redirect("/workspace");

  return (
    <div className="h-144 flex min-h-screen flex-col items-center gap-12 px-4 py-16">
      <h1 className="text-primary scroll-m-20 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent lg:text-8xl">
        Welcome to Kodix
      </h1>
      <div></div>
      <GradientHero />
    </div>
  );
}
