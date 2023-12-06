"use client";

import React from "react";
import { useTheme } from "next-themes";

export function GradientHero() {
  //Made a comment here to test graphite

  //Here I shall add a new comment to test graphite
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
