"use client";

import React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@kdx/ui";

export function ShouldRender({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "hidden w-full text-center md:block",
        !pathname.endsWith("/settings") && "block",
      )}
    >
      {children}
    </div>
  );
}
