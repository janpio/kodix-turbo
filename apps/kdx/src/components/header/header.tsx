import React from "react";
import Link from "next/link";

import { auth } from "@kdx/auth";
import {
  buttonVariants,
  cn,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@kdx/ui";

import HeaderFooterRemover from "../header-footer-remover";
import MaxWidthWrapper from "../max-width-wrapper";
import { TeamSwitcher } from "./team-switcher";
import { UserProfileButton } from "./user-profile-button";

export async function Header() {
  const session = await auth();

  return (
    <HeaderFooterRemover>
      <header className="border-b pb-2">
        <MaxWidthWrapper>
          <div className="mx-auto flex h-16 max-w-screen-2xl items-center">
            {!session && (
              <Link
                href="/"
                className="text-bold text-primary mx-5 text-xl font-medium"
              >
                Kodix
              </Link>
            )}
            {!!session && <TeamSwitcher />}

            <div className="ml-auto flex items-center space-x-4">
              <UserNav />
            </div>
          </div>
          <div className="mx-auto flex h-8 max-w-screen-2xl items-center px-4">
            <MainNav />
          </div>
        </MaxWidthWrapper>
      </header>
    </HeaderFooterRemover>
  );
}

async function MainNav() {
  const session = await auth();
  const navigation: {
    href: string;
    title: string;
    shown: boolean;
  }[] = [
    {
      href: "/marketplace",
      title: "Marketplace",
      shown: true,
    },
    {
      href: "/apps",
      title: "Apps",
      shown: !!session,
    },
  ];

  return (
    <NavigationMenu className="space-x-1">
      {navigation
        .filter((x) => x.shown)
        .map((item) => (
          <NavigationMenuList key={item.href}>
            <NavigationMenuItem>
              <Link href={item.href} legacyBehavior passHref>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle())}
                >
                  {item.title}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        ))}
    </NavigationMenu>
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
