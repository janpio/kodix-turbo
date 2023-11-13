"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import type { RouterOutputs } from "@kdx/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  toast,
} from "@kdx/ui";

import { api } from "~/trpc/react";
import { inviteColumns } from "./inviteColumns";

export function InviteDataTable({
  initialInvites,
}: {
  initialInvites: RouterOutputs["workspace"]["invitation"]["getAll"];
}) {
  const { data } = api.workspace.invitation.getAll.useQuery(undefined, {
    initialData: initialInvites,
  });

  const utils = api.useUtils();
  const { mutate } = api.workspace.invitation.delete.useMutation({
    onSuccess: () => {
      toast.success("Invite deleted.");
      void utils.workspace.invitation.getAll.invalidate();
    },
  });

  const columns = inviteColumns({ mutate });
  const table = useReactTable({
    data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No invitations right now
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
