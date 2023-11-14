"use client";

import React from "react";
import { useTheme } from "next-themes";

export function GradientHero() {
  const { theme } = useTheme();
  return (
    <>
      {theme === "light" ? (
        <div className="bg-foreground absolute inset-0 -z-10 h-full w-full [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)]"></div>
      ) : (
        <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]" />
      )}
    </>
  );
}
