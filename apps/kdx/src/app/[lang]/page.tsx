import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";

import type { Locale } from "../../../i18n-config";
import { getDictionary } from "../../../get-dictionary";

export default async function Home({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  const session = await auth();
  if (session) return redirect("/team");

  return (
    <main className="flex-1 py-8">
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-primary scroll-m-20 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent lg:text-8xl">
            {dictionary.counter.increment}
          </h1>
          <p className="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
            Solutions for your business. Kodix is a multi-purpose platform that
            provides a wide range of business solutions.
          </p>
          {/* <div className="space-x-4">
          <a
            className="focus-visible:ring-ring ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            href="/login"
          >
            Get Started
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            className="focus-visible:ring-ring ring-offset-background border-input hover:bg-accent hover:text-accent-foreground inline-flex h-11 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            href="https://github.com/shadcn/taxonomy"
          >
            GitHub
          </a>
        </div> */}
        </div>
      </section>
    </main>
  );
}
