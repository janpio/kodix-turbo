"use client";

import type { RowData } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import {
  AvatarWrapper,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@kdx/ui";

import type { Invite } from "../edit-ws-members-and-invites-card";

const columnHelper = createColumnHelper<Invite>();

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface AsdMeta<TData extends RowData> {
    hello: "world";
  }
}

export const inviteColumns = [
  columnHelper.accessor("inviteEmail", {
    header: ({ table }) => (
      <div className="flex items-center space-x-8">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
        <div className="text-muted-foreground">Select all</div>
      </div>
    ),
    cell: (info) => (
      <div className="flex flex-row space-x-8">
        <div className="flex flex-col items-center justify-center">
          <Checkbox
            checked={info.row.getIsSelected()}
            onCheckedChange={(value) => info.row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
        <div className="flex flex-col">
          <AvatarWrapper className="h-8 w-8" fallback={info.getValue()} />
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold">
            {info.cell.row.original.inviteEmail}
          </span>
          <span className="text-muted-foreground">{info.getValue()}</span>
        </div>
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    enableResizing: true,
  }),
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => {}}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
