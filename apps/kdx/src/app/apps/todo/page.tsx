"use client";

import { H1, Separator } from "@kdx/ui";

import { api } from "~/utils/api";
import { columns } from "~/components/Apps/Todo/columns";
import { CreateTaskDialogButton } from "~/components/Apps/Todo/create-task-dialog-button";
import { DataTable } from "~/components/Apps/Todo/data-table";

export default function Todo() {
  const { data } = api.todo.getAllForLoggedUser.useQuery();

  return (
    <>
      <H1>Todo</H1>
      <Separator className="my-4" />
      <CreateTaskDialogButton />
      <DataTable columns={columns} data={data ?? []} />
    </>
  );
}
