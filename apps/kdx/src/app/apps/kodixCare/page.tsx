import React from "react";
import { redirect } from "next/navigation";

import { H1, Separator } from "@kdx/ui";

import { IconKodixApp } from "~/app/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function KodixCare() {
  const onboardingCompleted = await api.kodixCare.onboardingCompleted.query();
  if (!onboardingCompleted) return redirect("/apps/kodixCare/onboarding");

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp
          appName="Kodix Care"
          appUrl="/kodixCare"
          renderText={false}
        />
        <H1>Kodix Care</H1>
      </div>
      <Separator className="my-4" />
    </MaxWidthWrapper>
  );
}
