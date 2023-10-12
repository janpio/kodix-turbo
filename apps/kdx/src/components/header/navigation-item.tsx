"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@kdx/ui";

export default function NavigationItem({
  href,
  title,
}: {
  href: string;
  title: string;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      key={href}
      className={cn(
        "hover:text-primary text-sm font-medium transition-colors",
        pathname !== href ? "text-muted-foreground" : null,
      )}
    >
      {title}
    </Link>
  );
}
