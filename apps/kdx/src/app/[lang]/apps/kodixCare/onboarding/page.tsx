import { redirect } from "next/navigation";

import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { api } from "~/trpc/server";
import OnboardingCard from "./_components/onboarding-card";

export default async function Onboarding() {
  const onboardingCompleted = await api.kodixCare.onboardingCompleted.query();
  if (onboardingCompleted) return redirect("/apps/kodixCare");

  return (
    <MaxWidthWrapper>
      <div className="flex h-[450px] items-center justify-center">
        <OnboardingCard />
      </div>
    </MaxWidthWrapper>
  );
}
