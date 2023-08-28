import React from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";

import { auth } from "@kdx/auth";
import { cn } from "@kdx/ui";

import { TeamSwitcher } from "./teamSwitcher";
import { UserProfileButton } from "./UserProfileButton";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-6 rounded-md px-2 py-1",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

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
  const pathname = "usePathname();";
  const navigation = [
    {
      href: "/marketplace",
      title: "Marketplace",
    },
    {
      href: "/apps",
      title: "Apps",
      shown: session?.user.id !== undefined,
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
          <Link
            href={item.href}
            key={item.href}
            className={cn(
              "hover:text-primary text-sm font-medium transition-colors",
              pathname !== item.href ? "text-muted-foreground" : null,
            )}
          >
            {item.title}
          </Link>
        ))}
    </nav>
  );
}

export async function UserNav() {
  const session = await auth();

  return (
    <>
      {session?.user.id && <UserProfileButton />}
      {!session?.user.id && (
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
