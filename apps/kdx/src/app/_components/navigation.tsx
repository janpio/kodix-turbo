"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@kdx/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@kdx/ui/navigationMenuTriggerStyle";
import { cn, useMediaQuery } from "@kdx/ui/utils";

export function Navigation({
  goBackItem,
  items,
}: {
  goBackItem: {
    href: string;
    title: string;
  };
  items: {
    href: string;
    title: string;
  }[];
}) {
  const pathname = usePathname();
  const isSmallerScreen = useMediaQuery({ query: "md" });
  const entryPoint = goBackItem.href.split("/").at(-1);
  if (!entryPoint) throw new Error("Your goBackItem.href is invalid");

  return (
    <NavigationMenu className="flex w-full max-w-4xl self-start">
      <NavigationMenuList
        className={cn("asdas flex w-full flex-col space-y-2")}
      >
        {!pathname.endsWith(entryPoint) && !isSmallerScreen ? (
          <NavigationItem href={goBackItem.href}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {goBackItem.title}
          </NavigationItem>
        ) : (
          items.map((item, i) => (
            <NavigationItem key={i} href={item.href}>
              {item.title}
            </NavigationItem>
          ))
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function NavigationItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          active={pathname === href}
          className={cn(
            navigationMenuTriggerStyle(),
            "justify-start text-center font-bold md:w-60",
          )}
        >
          {children}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}
