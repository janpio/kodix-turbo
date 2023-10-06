import moment from "moment";

import { H1, Separator } from "@kdx/ui";

import { columns } from "~/components/apps/kodix-care/columns";
import { CreateEventDialogButton } from "~/components/apps/kodix-care/create-event-dialog";
import { DataTable } from "~/components/apps/kodix-care/data-table";
import { api } from "~/trpc/server";

export default async function KodixCare() {
  //date Start should be the beginninig of the day
  //date End should be the end of the day

  const data = await api.event.getAll.query({
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
