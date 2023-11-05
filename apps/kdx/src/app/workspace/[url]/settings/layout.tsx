import { cn } from "@kdx/ui";

import MaxWidthWrapper from "~/components/max-width-wrapper";
import { SettingsNav } from "./_components/settings-nav";
import { ShouldRender } from "./general/_components/client-should-render";

export default function Layout({
  params,
  children,
}: {
  params: { url: string };
  children: React.ReactNode;
}) {
  return (
    <MaxWidthWrapper>
      <div className="h-28">
        <h1 className="text-4xl font-bold">Settings</h1>
      </div>
      <div className="flex flex-row">
        <SettingsNav url={params.url} />
        <ShouldRender>
          <div className={cn("w-full text-center md:block")}>{children}</div>
        </ShouldRender>
      </div>
    </MaxWidthWrapper>
  );
}
