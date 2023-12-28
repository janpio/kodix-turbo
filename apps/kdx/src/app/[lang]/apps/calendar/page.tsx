import Link from "next/link";
import { redirect } from "next/navigation";
import moment from "moment";

import { auth } from "@kdx/auth";
import { calendarAppId, kodixCareAppId } from "@kdx/shared";
import { buttonVariants, cn, H1, Separator } from "@kdx/ui";

import { IconKodixApp } from "~/app/[lang]/_components/app/kodix-app";
import { columns } from "~/app/[lang]/_components/apps/calendar/columns";
import { CreateEventDialogButton } from "~/app/[lang]/_components/apps/calendar/create-event-dialog";
import { DataTable } from "~/app/[lang]/_components/apps/calendar/data-table";
import MaxWidthWrapper from "~/app/[lang]/_components/max-width-wrapper";
import { api } from "~/trpc/server";

export default async function Calendar() {
  const session = await auth();
  if (!session) return redirect("/");

  const installedApps = await api.app.getInstalled.query();
  if (!installedApps.some((x) => x.id === calendarAppId))
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-red-500">You need to install this app first</h1>
        <Link
          href="/marketplace"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Marketplace
        </Link>
      </div>
    );

  //date Start should be the beginninig of the day
  //date End should be the end of the day
  const data = await api.event.getAll.query({
    dateStart: moment().utc().startOf("day").toDate(),
    dateEnd: moment().utc().endOf("day").toDate(),
  });

  return (
    <MaxWidthWrapper>
      <div className="flex space-x-4">
        <IconKodixApp appId={kodixCareAppId} renderText={false} />
        <H1>Calendar</H1>
      </div>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      <DataTable columns={columns} data={data} session={session} />
    </MaxWidthWrapper>
  );
}
