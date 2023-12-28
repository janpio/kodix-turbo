import React from "react";
import { redirect } from "next/navigation";

import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { kodixCareAppId } from "@kdx/shared";
import { H1, Separator } from "@kdx/ui";

import { IconKodixApp } from "~/app/[lang]/_components/app/kodix-app";
import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";

export const dynamic = "force-dynamic"; //TODO: help me
export default async function KodixCare() {
  const session = await auth();
  if (!session) return redirect("/");

  const installed = await prisma.app.findUnique({
    where: {
      id: kodixCareAppId,
      ActiveTeams: {
        some: {
          id: session.user.activeTeamId,
        },
      },
    },
  });

  if (!installed) return redirect("/apps/kodixCare/onboarding");

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={kodixCareAppId} renderText={false} />
        <H1>Kodix Care</H1>
      </div>
      <Separator className="my-4" />
    </MaxWidthWrapper>
  );
}
