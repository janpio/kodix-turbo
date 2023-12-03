import React from "react";
import { redirect } from "next/navigation";

import { Separator } from "@kdx/ui";
import { H1 } from "@kdx/ui/components/typography";

import MaxWidthWrapper from "~/app/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function KodixCare() {
  const onboardingCompleted = await api.kodixCare.onboardingCompleted.query();
  if (!onboardingCompleted) return redirect("/apps/kodixCare/onboarding");

  return (
    <MaxWidthWrapper>
      <H1>Kodix Care</H1>
      <Separator className="my-4" />
    </MaxWidthWrapper>
  );
}
