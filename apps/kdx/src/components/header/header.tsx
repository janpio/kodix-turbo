import React from "react";
import Link from "next/link";

import { auth } from "@kdx/auth";
import { buttonVariants, cn } from "@kdx/ui";

import NavigationLink from "./navigation-link";
import { TeamSwitcher } from "./team-switcher";
import { UserProfileButton } from "./user-profile-button";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 ">
        {!session && (
          <Link
            href="/"
            className="text-bold text-primary mx-5 text-xl font-medium"
          >
            Kodix
          </Link>
        )}
        {!!session && <TeamSwitcher />}

        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  );
}

async function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const session = await auth();
  const navigation = [
    {
      href: "/marketplace",
      title: "Marketplace",
    },
    {
      href: "/apps",
      title: "Apps",
      shown: !!session,
    },
  ].map((item) => ({ ...item, shown: item.shown ?? true })); // defaults shown to true if not defined

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {navigation
        .filter((x) => x.shown)
        .map((item) => (
          <NavigationLink key={item.href} href={item.href} title={item.title} />
        ))}
    </nav>
  );
}

export async function UserNav() {
  const session = await auth();

  return (
    <>
      {!!session && <UserProfileButton />}
      {!session && (
        <div className="mr-5 space-x-2">
          <Link href="/signIn" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link
            href="/signIn"
            className={buttonVariants({ variant: "default" })}
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  );
}
