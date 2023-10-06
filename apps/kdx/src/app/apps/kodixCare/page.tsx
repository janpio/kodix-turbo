import { redirect } from "next/navigation";
import moment from "moment";

import { appRouter } from "@kdx/api";
import { auth } from "@kdx/auth";
import { prisma } from "@kdx/db";
import { H1, Separator } from "@kdx/ui";

import { columns } from "~/components/apps/kodix-care/columns";
import { CreateEventDialogButton } from "~/components/apps/kodix-care/create-event-dialog";
import { DataTable } from "~/components/apps/kodix-care/data-table";

export default async function KodixCare() {
  const session = await auth();
  if (!session) return redirect("/");

  const caller = appRouter.createCaller({
    prisma,
    session,
  });
  //date Start should be the beginninig of the day
  //date End should be the end of the day
  const data = await caller.event.getAll({
    dateStart: moment().utc().startOf("day").toDate(),
    dateEnd: moment().utc().endOf("day").toDate(),
  });

  return (
    <>
      <H1>Kodix Care</H1>
      <Separator className="my-4" />
      <CreateEventDialogButton />
      <DataTable columns={columns} data={data} />
    </>
  );
}
