"use client";

import Link from "next/link";

import { cn, navigationMenuTriggerStyle } from "@kdx/ui";

export function SettingsNav({ url }: { url: string }) {
  const items = [
    {
      href: `/workspace/${url}/settings/general`,
      title: "General",
    },
    {
      href: `/workspace/${url}/settings/members`,
      title: "Members",
    },
  ];
  return (
    <div className="flex w-full max-w-min flex-col items-center space-y-2 pr-4">
      {items.map((item, i) => (
        <Link
          className={cn(
            navigationMenuTriggerStyle(),
            "w-60 justify-start font-bold",
          )}
          href={item.href}
          key={`${item.href}${i}`}
        >
          {item.title}
        </Link>
      ))}
    </div>
  );
}
