"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function ShouldRender({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldRender = pathname.endsWith("/settings");
  return shouldRender ? null : <>{children}</>;
}
